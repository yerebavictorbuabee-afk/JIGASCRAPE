import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Upload,
  Download,
  Filter,
  Archive,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  Lead,
  Market,
  BusinessCategory,
  PipelineStage,
  OpportunityPriority,
  WebsiteStatus,
} from '@/src/types/database.ts';
import { leadRepository, LeadFilterParams } from '@/src/lib/services/leadRepository.ts';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { LeadTable } from '@/src/components/leads/LeadTable.tsx';
import { FindLeadsModal } from '@/src/components/leads/FindLeadsModal.tsx';
import { CsvImportModal } from '@/src/components/leads/CsvImportModal.tsx';
import { AddLeadModal } from '@/src/components/leads/AddLeadModal.tsx';
import { NormalizedLeadResult } from '@/src/lib/services/types.ts';

interface LeadsPageProps {
  onSelectLead: (leadId: string) => void;
}

const PIPELINE_STAGES: PipelineStage[] = [
  'New',
  'Qualified',
  'Contacted',
  'In Discussion',
  'Closed Won',
  'Closed Lost',
];

export const LeadsPage: React.FC<LeadsPageProps> = ({ onSelectLead }) => {
  const { session } = useAuth();
  const orgId = session?.user?.organization_id || 'org_default';

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeadsForDedup, setAllLeadsForDedup] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [scoreRangeFilter, setScoreRangeFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [websiteStatusFilter, setWebsiteStatusFilter] = useState<WebsiteStatus | 'all'>('all');
  const [stageFilter, setStageFilter] = useState<PipelineStage | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState<'created_at' | 'opportunity_score' | 'business_name' | 'google_rating'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Settings
  const [markets, setMarkets] = useState<Market[]>([]);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);

  // Modals
  const [isFindModalOpen, setIsFindModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    loadMarketsAndCategories();
  }, [orgId]);

  useEffect(() => {
    loadLeads();
  }, [
    orgId,
    page,
    searchQuery,
    countryFilter,
    cityFilter,
    categoryFilter,
    scoreRangeFilter,
    websiteStatusFilter,
    stageFilter,
    sourceFilter,
    showArchived,
    sortBy,
    sortOrder,
  ]);

  const loadMarketsAndCategories = async () => {
    const [m, c] = await Promise.all([
      leadRepository.getMarkets(orgId),
      leadRepository.getCategories(orgId),
    ]);
    setMarkets(m);
    setCategories(c);
  };

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const filterParams: LeadFilterParams = {
        searchQuery: searchQuery.trim() || undefined,
        country: countryFilter !== 'all' ? countryFilter : undefined,
        city: cityFilter !== 'all' ? cityFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        scoreRange: scoreRangeFilter,
        websiteStatus: websiteStatusFilter !== 'all' ? websiteStatusFilter : undefined,
        pipelineStage: stageFilter !== 'all' ? stageFilter : undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
        archived: showArchived,
        sortBy,
        sortOrder,
        page,
        pageSize,
      };

      const res = await leadRepository.getLeads(orgId, filterParams);
      setLeads(res.leads);
      setTotal(res.total);
      setTotalPages(res.totalPages);

      // Also get all leads unfiltered for accurate deduplication check
      const allRes = await leadRepository.getLeads(orgId, { pageSize: 5000 });
      setAllLeadsForDedup(allRes.leads);
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk selections
  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSortChange = (column: 'created_at' | 'opportunity_score' | 'business_name' | 'google_rating') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'business_name' ? 'asc' : 'desc');
    }
  };

  const handleArchiveSingle = async (id: string) => {
    await leadRepository.archiveLead(orgId, id, session?.user?.id);
    loadLeads();
  };

  const handleBulkStageChange = async (newStage: PipelineStage) => {
    for (const id of Array.from(selectedIds)) {
      await leadRepository.updateLead(orgId, id, { pipeline_stage: newStage }, session?.user?.id);
    }
    setSelectedIds(new Set());
    loadLeads();
  };

  const handleBulkArchive = async () => {
    for (const id of Array.from(selectedIds)) {
      await leadRepository.archiveLead(orgId, id, session?.user?.id);
    }
    setSelectedIds(new Set());
    loadLeads();
  };

  const handleExportCsv = () => {
    const leadsToExport = selectedIds.size > 0
      ? leads.filter((l) => selectedIds.has(l.id))
      : leads;

    if (leadsToExport.length === 0) return;

    const headers = [
      'Business Name',
      'Category',
      'Country',
      'City',
      'Address',
      'Phone',
      'Email',
      'Website URL',
      'Google Maps URL',
      'Rating',
      'Reviews',
      'Opportunity Score',
      'Priority',
      'Website Status',
      'Pipeline Stage',
      'Source',
      'Created At',
    ];

    const escapeCsv = (val: any) => {
      if (val == null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = leadsToExport.map((l) => [
      escapeCsv(l.business_name),
      escapeCsv(l.category_name),
      escapeCsv(l.country),
      escapeCsv(l.city),
      escapeCsv(l.address),
      escapeCsv(l.phone),
      escapeCsv(l.email),
      escapeCsv(l.website_url),
      escapeCsv(l.google_maps_url),
      escapeCsv(l.google_rating),
      escapeCsv(l.review_count),
      escapeCsv(l.opportunity_score),
      escapeCsv(l.opportunity_priority),
      escapeCsv(l.website_status),
      escapeCsv(l.pipeline_stage),
      escapeCsv(l.source),
      escapeCsv(l.created_at),
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `jigaway_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import handlers
  const handleImportFromSerper = async (
    candidates: NormalizedLeadResult[],
    duplicateHandling: 'skip' | 'update_empty'
  ) => {
    await leadRepository.importBatch(orgId, candidates, {
      source: 'serper',
      duplicateHandling,
      actorId: session?.user?.id,
    });
    await loadLeads();
  };

  const handleImportFromCsv = async (
    candidates: Partial<Lead>[],
    duplicateHandling: 'skip' | 'update_empty',
    fileName: string,
    mapping: Record<string, string>
  ) => {
    const res = await leadRepository.importBatch(orgId, candidates, {
      source: 'csv',
      fileName,
      duplicateHandling,
      mapping,
      actorId: session?.user?.id,
    });
    await loadLeads();
    return res;
  };

  const handleAddManualLead = async (leadData: Partial<Lead>) => {
    const res = await leadRepository.createLead(orgId, leadData, session?.user?.id);
    if (!res.isDuplicate) {
      await loadLeads();
    }
    return res;
  };

  // Unique lists from data for filters
  const distinctCities = Array.from(new Set(allLeadsForDedup.map((l) => l.city).filter(Boolean)));
  const distinctCountries = Array.from(new Set(allLeadsForDedup.map((l) => l.country).filter(Boolean)));
  const distinctCategories = Array.from(new Set(allLeadsForDedup.map((l) => l.category_name).filter(Boolean))) as string[];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E9EC]">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717] tracking-tight">Leads</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Real commercial business discovery, qualification, and pipeline management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsFindModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#E30613] rounded-lg hover:bg-[#C80510] transition-colors shadow-2xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Find Leads</span>
          </button>

          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#374151] bg-white border border-[#E8E9EC] rounded-lg hover:bg-[#F9FAFB] transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#171717] bg-white border border-[#E8E9EC] rounded-lg hover:bg-[#F9FAFB] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 bg-white rounded-xl border border-[#E8E9EC] shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#98A1B2] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by business name, city, niche, or phone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E8E9EC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#171717] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              disabled={leads.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#374151] bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#E8E9EC] rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-[#F3F4F6]">
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E8E9EC] bg-[#F9FAFB] text-[#374151]"
          >
            <option value="all">All Countries</option>
            {distinctCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E8E9EC] bg-[#F9FAFB] text-[#374151]"
          >
            <option value="all">All Cities</option>
            {distinctCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E8E9EC] bg-[#F9FAFB] text-[#374151]"
          >
            <option value="all">All Niches / Categories</option>
            {distinctCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={scoreRangeFilter}
            onChange={(e) => setScoreRangeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E8E9EC] bg-[#F9FAFB] text-[#374151]"
          >
            <option value="all">All Scores</option>
            <option value="high">High Priority (20-30 pts)</option>
            <option value="medium">Medium Priority (15-19 pts)</option>
            <option value="low">Low Priority (&lt;15 pts)</option>
          </select>

          <select
            value={websiteStatusFilter}
            onChange={(e) => setWebsiteStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E8E9EC] bg-[#F9FAFB] text-[#374151]"
          >
            <option value="all">All Web Statuses</option>
            <option value="No Website">No Website</option>
            <option value="Broken">Broken / Unreachable</option>
            <option value="Outdated">Outdated</option>
            <option value="Modern">Modern</option>
            <option value="Candidate">Active Redesign Candidate</option>
          </select>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E8E9EC] bg-[#F9FAFB] text-[#374151]"
          >
            <option value="all">All Pipeline Stages</option>
            {PIPELINE_STAGES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E8E9EC] bg-[#F9FAFB] text-[#374151]"
          >
            <option value="all">All Sources</option>
            <option value="serper">Serper</option>
            <option value="csv_import">CSV Import</option>
            <option value="manual">Manual</option>
          </select>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              showArchived
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-[#F9FAFB] text-[#6B7280] border-[#E8E9EC] hover:text-[#171717]'
            }`}
          >
            {showArchived ? 'Showing Archived' : 'Show Archived'}
          </button>
        </div>
      </div>

      {/* Bulk Actions Banner */}
      {selectedIds.size > 0 && (
        <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-medium text-red-900">
            <span>{selectedIds.size} leads selected</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#6B7280]">Set stage:</span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStageChange(e.target.value as PipelineStage);
                }
              }}
              defaultValue=""
              className="px-2.5 py-1 rounded border border-red-200 bg-white text-[#171717]"
            >
              <option value="" disabled>
                Choose stage...
              </option>
              {PIPELINE_STAGES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <button
              onClick={handleBulkArchive}
              className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-red-100/50 text-red-700 border border-red-200 rounded transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table or Clean Empty State */}
      {allLeadsForDedup.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E9EC] p-12 text-center max-w-lg mx-auto shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-[#E8E9EC] flex items-center justify-center text-[#98A1B2] mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-[#171717]">No leads yet.</h2>
          <p className="text-xs text-[#6B7280] mt-1 mb-6 leading-relaxed">
            Discover real commercial businesses across Gulf markets using Serper or upload an existing client spreadsheet.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsFindModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#E30613] rounded-lg hover:bg-[#C80510] transition-colors shadow-2xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Find Leads</span>
            </button>
            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#374151] bg-white border border-[#E8E9EC] rounded-lg hover:bg-[#F9FAFB] transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Import CSV</span>
            </button>
          </div>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E9EC] p-10 text-center text-xs text-[#6B7280]">
          <p>No leads match your current filter selection.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setCountryFilter('all');
              setCityFilter('all');
              setCategoryFilter('all');
              setScoreRangeFilter('all');
              setWebsiteStatusFilter('all');
              setStageFilter('all');
              setSourceFilter('all');
            }}
            className="mt-3 px-3 py-1.5 text-xs text-[#171717] bg-[#F9FAFB] border border-[#E8E9EC] rounded-lg hover:bg-[#F3F4F6]"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <LeadTable
            leads={leads}
            selectedIds={selectedIds}
            onToggleSelectAll={toggleSelectAll}
            onToggleSelect={toggleSelect}
            onSelectLead={onSelectLead}
            onArchiveLead={handleArchiveSingle}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-[#6B7280] px-1">
            <span>
              Showing {leads.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(page * pageSize, total)} of {total} leads
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded border border-[#E8E9EC] bg-white disabled:opacity-40 hover:bg-[#F9FAFB]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-medium text-[#171717]">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded border border-[#E8E9EC] bg-white disabled:opacity-40 hover:bg-[#F9FAFB]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <FindLeadsModal
        isOpen={isFindModalOpen}
        onClose={() => setIsFindModalOpen(false)}
        onImport={handleImportFromSerper}
        existingLeads={allLeadsForDedup}
        availableMarkets={markets}
        availableCategories={categories}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImport={handleImportFromCsv}
        existingLeads={allLeadsForDedup}
      />

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddManualLead}
        availableMarkets={markets}
        availableCategories={categories}
      />
    </div>
  );
};
