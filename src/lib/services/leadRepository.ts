import {
  Lead,
  LeadScoreSignal,
  LeadImport,
  LeadActivity,
  LeadNote,
  Market,
  BusinessCategory,
  PipelineStage,
  OpportunityPriority,
  WebsiteStatus,
} from '@/src/types/database.ts';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase/client.ts';
import {
  initializeLeadSignals,
  calculateScoreFromSignals,
} from '@/src/lib/scoring/scoringEngine.ts';
import {
  checkDuplicateLead,
  mergeEmptyFields,
  normalizePhoneNumber,
} from '@/src/lib/utils/deduplication.ts';
import { NormalizedLeadResult } from '@/src/lib/services/types.ts';

const STORAGE_KEYS = {
  leads: (orgId: string) => `jigaway_leads_${orgId}`,
  signals: (orgId: string) => `jigaway_signals_${orgId}`,
  imports: (orgId: string) => `jigaway_imports_${orgId}`,
  activities: (orgId: string) => `jigaway_activities_${orgId}`,
  notes: (orgId: string) => `jigaway_notes_${orgId}`,
  markets: (orgId: string) => `jigaway_markets_${orgId}`,
  categories: (orgId: string) => `jigaway_categories_${orgId}`,
};

export interface LeadFilterParams {
  searchQuery?: string;
  country?: string;
  city?: string;
  category?: string;
  scoreRange?: 'all' | 'high' | 'medium' | 'low';
  priority?: OpportunityPriority | 'all';
  websiteStatus?: WebsiteStatus | 'all';
  pipelineStage?: PipelineStage | 'all';
  source?: string | 'all';
  archived?: boolean;
  sortBy?: 'created_at' | 'opportunity_score' | 'business_name' | 'google_rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface LeadListResponse {
  leads: Lead[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class LeadRepository {
  private getStorage<T>(key: string, defaultVal: T[] = []): T[] {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultVal;
      return JSON.parse(raw) as T[];
    } catch {
      return defaultVal;
    }
  }

  private setStorage<T>(key: string, val: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (err) {
      console.error(`Failed saving to localStorage [${key}]:`, err);
    }
  }

  // --------------------------------------------------------------------------
  // LEADS
  // --------------------------------------------------------------------------

  async getLeads(orgId: string, params: LeadFilterParams = {}): Promise<LeadListResponse> {
    const rawLeads = this.getStorage<Lead>(STORAGE_KEYS.leads(orgId), []);
    
    // Filter
    let filtered = rawLeads.filter((lead) => {
      if (params.archived ? !lead.archived_at : lead.archived_at) {
        return false;
      }

      if (params.searchQuery) {
        const q = params.searchQuery.toLowerCase().trim();
        const matchesName = lead.business_name.toLowerCase().includes(q);
        const matchesCity = lead.city?.toLowerCase().includes(q);
        const matchesCategory = lead.category_name?.toLowerCase().includes(q);
        const matchesPhone = lead.phone?.includes(q);
        if (!matchesName && !matchesCity && !matchesCategory && !matchesPhone) return false;
      }

      if (params.country && params.country !== 'all' && lead.country.toLowerCase() !== params.country.toLowerCase()) {
        return false;
      }

      if (params.city && params.city !== 'all' && lead.city.toLowerCase() !== params.city.toLowerCase()) {
        return false;
      }

      if (params.category && params.category !== 'all' && lead.category_name?.toLowerCase() !== params.category.toLowerCase()) {
        return false;
      }

      if (params.priority && params.priority !== 'all' && lead.opportunity_priority !== params.priority) {
        return false;
      }

      if (params.scoreRange && params.scoreRange !== 'all') {
        if (params.scoreRange === 'high' && lead.opportunity_score < 20) return false;
        if (params.scoreRange === 'medium' && (lead.opportunity_score < 15 || lead.opportunity_score >= 20)) return false;
        if (params.scoreRange === 'low' && lead.opportunity_score >= 15) return false;
      }

      if (params.websiteStatus && params.websiteStatus !== 'all' && lead.website_status !== params.websiteStatus) {
        return false;
      }

      if (params.pipelineStage && params.pipelineStage !== 'all' && lead.pipeline_stage !== params.pipelineStage) {
        return false;
      }

      if (params.source && params.source !== 'all' && lead.source.toLowerCase() !== params.source.toLowerCase()) {
        return false;
      }

      return true;
    });

    // Sort
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'opportunity_score') {
        comparison = (a.opportunity_score || 0) - (b.opportunity_score || 0);
      } else if (sortBy === 'business_name') {
        comparison = a.business_name.localeCompare(b.business_name);
      } else if (sortBy === 'google_rating') {
        comparison = (a.google_rating || 0) - (b.google_rating || 0);
      } else {
        // created_at
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Pagination
    const total = filtered.length;
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return {
      leads: paginated,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getLeadById(orgId: string, leadId: string): Promise<Lead | null> {
    const rawLeads = this.getStorage<Lead>(STORAGE_KEYS.leads(orgId), []);
    const found = rawLeads.find((l) => l.id === leadId);
    if (!found) return null;

    // Attach signals
    const signals = await this.getSignalsForLead(orgId, leadId);
    return { ...found, score_signals: signals };
  }

  async createLead(
    orgId: string,
    leadData: Partial<Lead>,
    actorId?: string
  ): Promise<{ lead: Lead; isDuplicate: boolean; duplicateReason?: string }> {
    const rawLeads = this.getStorage<Lead>(STORAGE_KEYS.leads(orgId), []);
    const dupCheck = checkDuplicateLead(leadData, rawLeads);

    if (dupCheck.isDuplicate && dupCheck.matchedLead) {
      return {
        lead: dupCheck.matchedLead,
        isDuplicate: true,
        duplicateReason: dupCheck.reason,
      };
    }

    const id = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    const hasWebsite = leadData.website_url && leadData.website_url.trim().length > 0;
    const websiteStatus: WebsiteStatus = hasWebsite ? 'Modern' : 'No Website';

    const normalizedPhone = normalizePhoneNumber(leadData.phone);

    // Initialize scoring signals
    const signals = initializeLeadSignals(
      {
        ...leadData,
        website_url: leadData.website_url || null,
        website_status: websiteStatus,
      },
      id
    );

    const { score, priority } = calculateScoreFromSignals(signals);

    const newLead: Lead = {
      id,
      organization_id: orgId,
      business_name: leadData.business_name!.trim(),
      business_category_id: leadData.business_category_id || null,
      category_name: leadData.category_name || undefined,
      country: leadData.country?.trim() || 'United Arab Emirates',
      country_code: leadData.country_code || 'AE',
      city: leadData.city?.trim() || 'Dubai',
      address: leadData.address?.trim() || null,
      phone: leadData.phone?.trim() || null,
      normalized_phone: normalizedPhone || null,
      email: leadData.email?.trim() || null,
      website_url: leadData.website_url?.trim() || null,
      google_maps_url: leadData.google_maps_url || null,
      google_rating: leadData.google_rating ?? null,
      review_count: leadData.review_count ?? 0,
      opening_hours: leadData.opening_hours || null,
      business_description: leadData.business_description?.trim() || null,
      logo_url: leadData.logo_url || null,
      source: leadData.source || 'manual',
      source_external_id: leadData.source_external_id || null,
      source_metadata: leadData.source_metadata || null,
      pipeline_stage: leadData.pipeline_stage || 'New',
      opportunity_score: score,
      opportunity_priority: priority,
      website_status: websiteStatus,
      contact_status: 'Uncontacted',
      concept_status: 'Not Started',
      created_at: now,
      updated_at: now,
      score_signals: signals,
    };

    rawLeads.unshift(newLead);
    this.setStorage(STORAGE_KEYS.leads(orgId), rawLeads);
    this.saveSignals(orgId, id, signals);

    // Record activity
    await this.addActivity(
      orgId,
      id,
      'lead_created',
      'Lead Added',
      leadData.source === 'serper'
        ? 'Discovered via Serper search and imported into Jigaway'
        : leadData.source === 'csv_import'
        ? 'Imported via CSV batch upload'
        : 'Manually created in Jigaway lead workspace',
      { source: newLead.source, initialScore: score, priority },
      actorId
    );

    return { lead: newLead, isDuplicate: false };
  }

  async updateLead(
    orgId: string,
    leadId: string,
    updates: Partial<Lead>,
    actorId?: string
  ): Promise<Lead | null> {
    const rawLeads = this.getStorage<Lead>(STORAGE_KEYS.leads(orgId), []);
    const idx = rawLeads.findIndex((l) => l.id === leadId);
    if (idx === -1) return null;

    const existing = rawLeads[idx];
    const now = new Date().toISOString();

    const stageChanged = updates.pipeline_stage && updates.pipeline_stage !== existing.pipeline_stage;
    const prevStage = existing.pipeline_stage;

    const updated: Lead = {
      ...existing,
      ...updates,
      updated_at: now,
    };

    rawLeads[idx] = updated;
    this.setStorage(STORAGE_KEYS.leads(orgId), rawLeads);

    if (stageChanged) {
      await this.addActivity(
        orgId,
        leadId,
        'stage_change',
        'Pipeline Stage Changed',
        `Moved from ${prevStage} to ${updates.pipeline_stage}`,
        { from: prevStage, to: updates.pipeline_stage },
        actorId
      );
    } else {
      await this.addActivity(
        orgId,
        leadId,
        'lead_updated',
        'Lead Information Updated',
        'Lead fields were updated',
        updates,
        actorId
      );
    }

    return updated;
  }

  async archiveLead(orgId: string, leadId: string, actorId?: string): Promise<boolean> {
    const rawLeads = this.getStorage<Lead>(STORAGE_KEYS.leads(orgId), []);
    const idx = rawLeads.findIndex((l) => l.id === leadId);
    if (idx === -1) return false;

    const isArchived = !rawLeads[idx].archived_at;
    rawLeads[idx].archived_at = isArchived ? new Date().toISOString() : null;
    this.setStorage(STORAGE_KEYS.leads(orgId), rawLeads);

    await this.addActivity(
      orgId,
      leadId,
      isArchived ? 'archived' : 'restored',
      isArchived ? 'Lead Archived' : 'Lead Restored',
      isArchived ? 'Lead was moved to archive' : 'Lead was restored to active pipeline',
      {},
      actorId
    );

    return true;
  }

  // --------------------------------------------------------------------------
  // BATCH IMPORT (SERPER & CSV)
  // --------------------------------------------------------------------------

  async importBatch(
    orgId: string,
    candidates: Partial<Lead>[],
    options: {
      source: 'serper' | 'csv';
      fileName?: string;
      duplicateHandling: 'skip' | 'update_empty';
      mapping?: Record<string, string>;
      actorId?: string;
    }
  ): Promise<{
    imported: Lead[];
    updated: Lead[];
    skipped: number;
    failed: number;
    importId: string;
  }> {
    const rawLeads = this.getStorage<Lead>(STORAGE_KEYS.leads(orgId), []);
    const imported: Lead[] = [];
    const updated: Lead[] = [];
    let skipped = 0;
    let failed = 0;

    for (const candidate of candidates) {
      if (!candidate.business_name || !candidate.business_name.trim()) {
        failed++;
        continue;
      }

      const dup = checkDuplicateLead(candidate, rawLeads);

      if (dup.isDuplicate && dup.matchedLead) {
        if (options.duplicateHandling === 'update_empty') {
          const merged = mergeEmptyFields(dup.matchedLead, candidate);
          const idx = rawLeads.findIndex((l) => l.id === dup.matchedLead!.id);
          if (idx !== -1) {
            rawLeads[idx] = merged;
            updated.push(merged);
            await this.addActivity(
              orgId,
              merged.id,
              'lead_updated',
              'Lead Updated via Import',
              `Missing details enriched from ${options.source} import`,
              {},
              options.actorId
            );
          }
        } else {
          skipped++;
        }
      } else {
        // Create new
        const id = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const now = new Date().toISOString();
        const hasWebsite = candidate.website_url && candidate.website_url.trim().length > 0;
        const websiteStatus: WebsiteStatus = hasWebsite ? 'Modern' : 'No Website';

        const signals = initializeLeadSignals(
          {
            ...candidate,
            website_url: candidate.website_url || null,
            website_status: websiteStatus,
          },
          id
        );
        const { score, priority } = calculateScoreFromSignals(signals);

        const newLead: Lead = {
          id,
          organization_id: orgId,
          business_name: candidate.business_name.trim(),
          business_category_id: candidate.business_category_id || null,
          category_name: candidate.category_name || undefined,
          country: candidate.country?.trim() || 'United Arab Emirates',
          country_code: candidate.country_code || 'AE',
          city: candidate.city?.trim() || 'Dubai',
          address: candidate.address?.trim() || null,
          phone: candidate.phone?.trim() || null,
          normalized_phone: normalizePhoneNumber(candidate.phone),
          email: candidate.email?.trim() || null,
          website_url: candidate.website_url?.trim() || null,
          google_maps_url: candidate.google_maps_url || null,
          google_rating: candidate.google_rating ?? null,
          review_count: candidate.review_count ?? 0,
          opening_hours: candidate.opening_hours || null,
          business_description: candidate.business_description?.trim() || null,
          logo_url: candidate.logo_url || null,
          source: options.source === 'serper' ? 'serper' : 'csv_import',
          source_external_id: candidate.source_external_id || null,
          source_metadata: candidate.source_metadata || null,
          pipeline_stage: 'New',
          opportunity_score: score,
          opportunity_priority: priority,
          website_status: websiteStatus,
          contact_status: 'Uncontacted',
          concept_status: 'Not Started',
          created_at: now,
          updated_at: now,
        };

        rawLeads.unshift(newLead);
        this.saveSignals(orgId, id, signals);
        imported.push(newLead);

        await this.addActivity(
          orgId,
          id,
          'lead_created',
          options.source === 'serper' ? 'Imported from Serper' : 'Imported from CSV',
          options.source === 'serper'
            ? `Discovered via Serper search and imported into Jigaway`
            : `Imported from CSV file: ${options.fileName || 'leads.csv'}`,
          { initialScore: score, priority },
          options.actorId
        );
      }
    }

    this.setStorage(STORAGE_KEYS.leads(orgId), rawLeads);

    // Record lead_import record
    const importId = `imp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const importRecord: LeadImport = {
      id: importId,
      organization_id: orgId,
      source: options.source,
      file_name: options.fileName || `${options.source}_batch_${Date.now()}`,
      status: 'completed',
      total_rows: candidates.length,
      imported_count: imported.length,
      updated_count: updated.length,
      skipped_count: skipped,
      failed_count: failed,
      mapping: options.mapping || {},
      created_by: options.actorId || null,
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    };

    const imports = this.getStorage<LeadImport>(STORAGE_KEYS.imports(orgId), []);
    imports.unshift(importRecord);
    this.setStorage(STORAGE_KEYS.imports(orgId), imports);

    return {
      imported,
      updated,
      skipped,
      failed,
      importId,
    };
  }

  // --------------------------------------------------------------------------
  // SCORE SIGNALS & QUALIFICATION
  // --------------------------------------------------------------------------

  async getSignalsForLead(orgId: string, leadId: string): Promise<LeadScoreSignal[]> {
    const signalsMap = this.getStorage<LeadScoreSignal>(STORAGE_KEYS.signals(orgId), []);
    const found = signalsMap.filter((s) => s.lead_id === leadId);
    if (found.length > 0) return found;

    // If none yet stored, initialize them
    const lead = await this.getLeadById(orgId, leadId);
    if (!lead) return [];
    const initialized = initializeLeadSignals(lead, leadId);
    this.saveSignals(orgId, leadId, initialized);
    return initialized;
  }

  private saveSignals(orgId: string, leadId: string, newSignals: LeadScoreSignal[]): void {
    const all = this.getStorage<LeadScoreSignal>(STORAGE_KEYS.signals(orgId), []);
    const filtered = all.filter((s) => s.lead_id !== leadId);
    filtered.push(...newSignals);
    this.setStorage(STORAGE_KEYS.signals(orgId), filtered);
  }

  async updateSignal(
    orgId: string,
    leadId: string,
    signalKey: string,
    status: 'unknown' | 'confirmed' | 'not_present',
    evidence?: string,
    actorId?: string
  ): Promise<{ lead: Lead; signals: LeadScoreSignal[] }> {
    const signals = await this.getSignalsForLead(orgId, leadId);
    const signalIndex = signals.findIndex((s) => s.signal_key === signalKey);
    const now = new Date().toISOString();

    if (signalIndex !== -1) {
      signals[signalIndex] = {
        ...signals[signalIndex],
        status,
        evidence: evidence ?? signals[signalIndex].evidence,
        source: 'manual',
        confirmed_by: status === 'confirmed' ? actorId || null : null,
        confirmed_at: status === 'confirmed' ? now : null,
        updated_at: now,
      };
    }

    this.saveSignals(orgId, leadId, signals);

    // Recalculate score
    const { score, priority } = calculateScoreFromSignals(signals);
    const lead = await this.updateLead(
      orgId,
      leadId,
      {
        opportunity_score: score,
        opportunity_priority: priority,
      },
      actorId
    );

    // Record activity
    const signalRule = signals[signalIndex]?.label || signalKey;
    await this.addActivity(
      orgId,
      leadId,
      'qualification_updated',
      'Qualification Signal Updated',
      `"${signalRule}" set to ${status.toUpperCase()} (${status === 'confirmed' ? `+${signals[signalIndex].points} pts` : '0 pts'}). New score: ${score}/30`,
      { signalKey, status, score, priority, evidence },
      actorId
    );

    return {
      lead: lead!,
      signals,
    };
  }

  async recalculateScore(orgId: string, leadId: string, actorId?: string): Promise<Lead | null> {
    const lead = await this.getLeadById(orgId, leadId);
    if (!lead) return null;

    const signals = await this.getSignalsForLead(orgId, leadId);
    const { score, priority } = calculateScoreFromSignals(signals);

    const updated = await this.updateLead(
      orgId,
      leadId,
      {
        opportunity_score: score,
        opportunity_priority: priority,
      },
      actorId
    );

    await this.addActivity(
      orgId,
      leadId,
      'score_recalculated',
      'Opportunity Score Recalculated',
      `Score updated to ${score}/30 (${priority}) based on confirmed signals.`,
      { score, priority },
      actorId
    );

    return updated;
  }

  // --------------------------------------------------------------------------
  // ACTIVITIES
  // --------------------------------------------------------------------------

  async getActivities(orgId: string, leadId: string): Promise<LeadActivity[]> {
    const all = this.getStorage<LeadActivity>(STORAGE_KEYS.activities(orgId), []);
    return all
      .filter((a) => a.lead_id === leadId)
      .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
  }

  async addActivity(
    orgId: string,
    leadId: string,
    activityType: string,
    title: string,
    description?: string,
    metadata?: Record<string, unknown>,
    actorId?: string
  ): Promise<LeadActivity> {
    const all = this.getStorage<LeadActivity>(STORAGE_KEYS.activities(orgId), []);
    const activity: LeadActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      organization_id: orgId,
      lead_id: leadId,
      actor_id: actorId || null,
      activity_type: activityType,
      title,
      description: description || null,
      metadata: metadata || {},
      occurred_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    all.unshift(activity);
    this.setStorage(STORAGE_KEYS.activities(orgId), all);
    return activity;
  }

  async getAllActivities(orgId: string, limit = 50): Promise<LeadActivity[]> {
    const all = this.getStorage<LeadActivity>(STORAGE_KEYS.activities(orgId), []);
    return all
      .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
      .slice(0, limit);
  }

  async getImports(orgId: string): Promise<LeadImport[]> {
    return this.getStorage<LeadImport>(STORAGE_KEYS.imports(orgId), []);
  }

  // --------------------------------------------------------------------------
  // NOTES
  // --------------------------------------------------------------------------

  async getNotes(orgId: string, leadId: string): Promise<LeadNote[]> {
    const all = this.getStorage<LeadNote>(STORAGE_KEYS.notes(orgId), []);
    return all
      .filter((n) => n.lead_id === leadId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async addNote(
    orgId: string,
    leadId: string,
    content: string,
    authorName?: string,
    authorId?: string
  ): Promise<LeadNote> {
    const all = this.getStorage<LeadNote>(STORAGE_KEYS.notes(orgId), []);
    const note: LeadNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      lead_id: leadId,
      author_id: authorId || null,
      author_name: authorName || 'Team Member',
      content: content.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    all.unshift(note);
    this.setStorage(STORAGE_KEYS.notes(orgId), all);

    await this.addActivity(
      orgId,
      leadId,
      'note_added',
      'Internal Note Added',
      content.length > 80 ? `${content.slice(0, 80)}...` : content,
      { noteId: note.id },
      authorId
    );

    return note;
  }

  async updateNote(
    orgId: string,
    noteId: string,
    newContent: string
  ): Promise<LeadNote | null> {
    const all = this.getStorage<LeadNote>(STORAGE_KEYS.notes(orgId), []);
    const idx = all.findIndex((n) => n.id === noteId);
    if (idx === -1) return null;

    all[idx].content = newContent.trim();
    all[idx].updated_at = new Date().toISOString();
    this.setStorage(STORAGE_KEYS.notes(orgId), all);
    return all[idx];
  }

  async deleteNote(orgId: string, noteId: string): Promise<boolean> {
    const all = this.getStorage<LeadNote>(STORAGE_KEYS.notes(orgId), []);
    const filtered = all.filter((n) => n.id !== noteId);
    if (filtered.length === all.length) return false;
    this.setStorage(STORAGE_KEYS.notes(orgId), filtered);
    return true;
  }

  // --------------------------------------------------------------------------
  // SETTINGS: MARKETS & CATEGORIES (starts empty, user configurable)
  // --------------------------------------------------------------------------

  async getMarkets(orgId: string): Promise<Market[]> {
    return this.getStorage<Market>(STORAGE_KEYS.markets(orgId), []);
  }

  async addMarket(orgId: string, country: string, city: string): Promise<Market> {
    const markets = await this.getMarkets(orgId);
    const newMarket: Market = {
      id: `mkt_${Date.now()}`,
      organization_id: orgId,
      country: country.trim(),
      country_code: country.toLowerCase().includes('saudi') ? 'SA' : 'AE',
      city: city.trim(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    markets.push(newMarket);
    this.setStorage(STORAGE_KEYS.markets(orgId), markets);
    return newMarket;
  }

  async toggleMarketActive(orgId: string, marketId: string): Promise<Market | null> {
    const markets = await this.getMarkets(orgId);
    const idx = markets.findIndex((m) => m.id === marketId);
    if (idx === -1) return null;
    markets[idx].is_active = !markets[idx].is_active;
    markets[idx].updated_at = new Date().toISOString();
    this.setStorage(STORAGE_KEYS.markets(orgId), markets);
    return markets[idx];
  }

  async deleteMarket(orgId: string, marketId: string): Promise<boolean> {
    const markets = await this.getMarkets(orgId);
    const filtered = markets.filter((m) => m.id !== marketId);
    this.setStorage(STORAGE_KEYS.markets(orgId), filtered);
    return true;
  }

  async getCategories(orgId: string): Promise<BusinessCategory[]> {
    return this.getStorage<BusinessCategory>(STORAGE_KEYS.categories(orgId), []);
  }

  async addCategory(orgId: string, name: string, description?: string): Promise<BusinessCategory> {
    const categories = await this.getCategories(orgId);
    const newCat: BusinessCategory = {
      id: `cat_${Date.now()}`,
      organization_id: orgId,
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description?.trim() || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    categories.push(newCat);
    this.setStorage(STORAGE_KEYS.categories(orgId), categories);
    return newCat;
  }

  async toggleCategoryActive(orgId: string, categoryId: string): Promise<BusinessCategory | null> {
    const categories = await this.getCategories(orgId);
    const idx = categories.findIndex((c) => c.id === categoryId);
    if (idx === -1) return null;
    categories[idx].is_active = !categories[idx].is_active;
    categories[idx].updated_at = new Date().toISOString();
    this.setStorage(STORAGE_KEYS.categories(orgId), categories);
    return categories[idx];
  }

  async deleteCategory(orgId: string, categoryId: string): Promise<boolean> {
    const categories = await this.getCategories(orgId);
    const filtered = categories.filter((c) => c.id !== categoryId);
    this.setStorage(STORAGE_KEYS.categories(orgId), filtered);
    return true;
  }
}

export const leadRepository = new LeadRepository();
