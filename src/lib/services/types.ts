/**
 * Service Provider Interfaces for Jigaway Gulf Client Acquisition Hub
 * All external data providers and AI engines are isolated behind these contracts
 * to prevent vendor lock-in and enable seamless phase-by-phase implementation.
 */

// ==============================================================================
// 1. Lead Data Provider Interface (Phase 2 - Serper)
// Connects to Serper for discovering Gulf business leads via Google search / places data
// ==============================================================================
export interface LeadSearchParams {
  category: string;
  city: string;
  country: string;
  countryCode?: string;
  limit?: number; // 10, 25, 50, 100 (default 25)
}

export interface NormalizedLeadResult {
  source_external_id?: string;
  business_name: string;
  category_name?: string;
  country: string;
  country_code: string;
  city: string;
  address?: string | null;
  phone?: string | null;
  normalized_phone?: string | null;
  email?: string | null;
  website_url?: string | null;
  google_maps_url?: string | null;
  google_rating?: number | null;
  review_count: number;
  opening_hours?: Record<string, string> | null;
  business_description?: string | null;
  logo_url?: string | null;
  source: 'serper';
  source_metadata: Record<string, unknown>;
}

export interface SerperSearchResponse {
  success: boolean;
  totalFound: number;
  results: NormalizedLeadResult[];
  queryUsed: string;
  error?: string;
  isConfigured: boolean;
}

export interface LeadDataProvider {
  readonly providerName: string;
  searchLeads(params: LeadSearchParams): Promise<SerperSearchResponse>;
}

// ==============================================================================
// 2. Website Analysis Provider Interface (Phase 2 & 3)
// Audits mobile responsiveness, speed heuristics, meta tags, and digital opportunity gaps.
// (No external screenshot or headless browser dependencies required)
// ==============================================================================
export interface AuditResult {
  hasWebsite: boolean;
  isMobileResponsive: boolean;
  loadSpeedSeconds?: number;
  hasWhatsAppButton: boolean;
  hasModernDesign: boolean;
  strengths: string[];
  digitalGaps: string[];
  opportunitySummary: string;
  score: number; // 0-100
}

export interface WebsiteAnalysisProvider {
  readonly providerName: string;
  auditWebsite(url: string | null): Promise<AuditResult>;
}

// ==============================================================================
// 3. AI Provider Interface (Phase 3 & 4)
// Powers free-value website concepts, tailored WhatsApp hooks, and sales copy.
// ==============================================================================
export interface ConceptGenerationInput {
  businessName: string;
  city: string;
  category: string;
  currentWebsiteStatus: string;
  digitalGaps: string[];
  targetAudience?: string;
}

export interface GeneratedConcept {
  headline: string;
  subheadline: string;
  recommendedColorPalette: string[];
  heroCallToAction: string;
  keyServices: { title: string; description: string }[];
  whatsappPitchAngle: string;
  htmlPreviewSnippet?: string;
}

export interface OutreachDraftInput {
  businessName: string;
  ownerName?: string;
  channel: 'whatsapp' | 'email';
  opportunityAngle: string;
  conceptUrl: string;
}

export interface AIProvider {
  readonly providerName: string;
  generateWebsiteConcept(input: ConceptGenerationInput): Promise<GeneratedConcept>;
  draftOutreachMessage(input: OutreachDraftInput): Promise<string>;
  generateFollowUpMessage(history: { channel: string; date: string }[]): Promise<string>;
}

// ==============================================================================
// 4. Storage Provider Interface (Phase 3 & 5)
// Stores concept assets, client assets, proposals, and generated artifacts.
// ==============================================================================
export interface StorageProvider {
  readonly providerName: string;
  uploadAsset(path: string, file: Blob | Buffer, contentType: string): Promise<string>;
  getPublicUrl(path: string): string;
  deleteAsset(path: string): Promise<void>;
}

