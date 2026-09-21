import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  Globe,
  Upload,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Search,
  Plus,
  Activity,
  Calendar,
} from 'lucide-react';
import { Lead, LeadImport, LeadActivity, PipelineStage } from '@/src/types/database.ts';
import { leadRepository } from '@/src/lib/services/leadRepository.ts';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { OpportunityBadge, PipelineStageBadge, WebsiteStatusBadge } from '@/src/components/ui/StatusBadge.tsx';
import { FindLeadsModal } from '@/src/components/leads/FindLeadsModal.tsx';
import { CsvImportModal } from '@/src/components/leads/CsvImportModal.tsx';
import { NormalizedLeadResult } from '@/src/lib/services/types.ts';

interface DashboardPageProps {
  onNavigateToLead: (leadId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToLead }) => {
  const { session } = useAuth();
  const orgId = session?.user?.organization_id || 'org_default';

  const [leads, setLeads] = useState<Lead[]>([]);
  const [imports, setImports] = useState<LeadImport[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isFindModalOpen, setIsFindModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [orgId]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [leadsRes, importsRes, actsRes] = await Promise.all([
        leadRepository.getLeads(orgId, { pageSize: 5000, archived: false }),
        leadRepository.getImports(orgId),
        leadRepository.getAllActivities(orgId, 20),
      ]);
      setLeads(leadsRes.leads);
      setImports(importsRes);
      setActivities(actsRes);
    } finally {
      setIsLoading(false);
    }
  };

  // Real KPI calculations from Phase 2 data only
  const totalLeads = leads.length;
  const highPriorityCount = leads.filter((l) => l.opportunity_score >= 20).length;
  const noWebsiteCount = leads.filter((l) => l.website_status === 'No Website').length;
  const importsCompletedCount = imports.length;

  // Pipeline stages distribution
  const pipelineStages: PipelineStage[] = [
    'New',
    'Qualified',
    'Contacted',
    'In Discussion',
    'Closed Won',
    'Closed Lost',
  ];
  const stageCounts = pipelineStages.map((st) => ({
    stage: st,
    count: leads.filter((l) => l.pipeline_stage === st).length,
  }));

  // Recent leads (sorted by created_at desc)
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const handleImportFromSerper = async (
    candidates: NormalizedLeadResult[],
    duplicateHandling: 'skip' | 'update_empty'
  ) => {
    await leadRepository.importBatch(orgId, candidates, {
      source: 'serper',
      duplicateHandling,
      actorId: session?.user?.id,
    });
    await loadDashboardData();
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
    await loadDashboardData();
    return res;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E9EC]">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717] tracking-tight leading-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Real Gulf business acquisition engine metrics and pipeline status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#374151] bg-white border border-[#E8E9EC] rounded-lg hover:bg-[#F9FAFB] transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => setIsFindModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#E30613] rounded-lg hover:bg-[#C80510] transition-colors shadow-2xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Find Leads</span>
          </button>
        </div>
      </div>

      {/* 2. Core Phase 2 Real Metrics */}
      <div className="bg-white border border-[#E8E9EC] rounded-xl overflow-hidden shadow-2xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E9EC]">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B7280]">Total Leads</span>
              <Users className="w-4 h-4 text-[#98A1B2]" />
            </div>
            <div className="mt-2 text-2xl sm:text-[28px] font-semibold text-[#171717] tracking-tight">
              {totalLeads}
            </div>
            <span className="text-[11px] text-[#98A1B2]">Gulf prospect database</span>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B7280]">High Priority</span>
              <Award className="w-4 h-4 text-[#E30613]" />
            </div>
            <div className="mt-2 text-2xl sm:text-[28px] font-semibold text-[#E30613] tracking-tight">
              {highPriorityCount}
            </div>
            <span className="text-[11px] text-[#98A1B2]">Scored 20–30 points</span>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B7280]">No Website</span>
              <Globe className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl sm:text-[28px] font-semibold text-[#171717] tracking-tight">
              {noWebsiteCount}
            </div>
            <span className="text-[11px] text-[#98A1B2]">Clear web redesign hook</span>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B7280]">Imports Completed</span>
              <Upload className="w-4 h-4 text-[#98A1B2]" />
            </div>
            <div className="mt-2 text-2xl sm:text-[28px] font-semibold text-[#171717] tracking-tight">
              {importsCompletedCount}
            </div>
            <span className="text-[11px] text-[#98A1B2]">Serper & CSV import batches</span>
          </div>
        </div>
      </div>

      {/* 3. Real Pipeline Stage Distribution */}
      <div className="bg-white border border-[#E8E9EC] rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#171717]">Pipeline Distribution</h2>
          <span className="text-xs text-[#98A1B2]">{totalLeads} active leads</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stageCounts.map(({ stage, count }) => (
            <div key={stage} className="p-3 rounded-lg bg-[#F9FAFB] border border-[#E8E9EC]">
              <span className="text-xs font-medium text-[#6B7280] block truncate">{stage}</span>
              <div className="text-xl font-bold text-[#171717] mt-1">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recent Real Leads & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Real Leads */}
        <div className="bg-white border border-[#E8E9EC] rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#171717]">Recent Leads</h2>
            <span className="text-xs text-[#98A1B2]">Latest additions</span>
          </div>

          {recentLeads.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#98A1B2]">
              <p>No leads discovered or imported yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F3F4F6]">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onNavigateToLead(lead.id)}
                  className="py-2.5 flex items-center justify-between gap-3 hover:bg-[#F9FAFB] px-1 rounded cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-[#171717] truncate hover:text-[#E30613]">
                      {lead.business_name}
                    </div>
                    <div className="text-[11px] text-[#6B7280]">
                      {lead.city}, {lead.country_code} • {lead.category_name || 'Commercial'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <WebsiteStatusBadge status={lead.website_status} />
                    <span className="text-xs font-bold text-[#171717] bg-[#F9FAFB] px-2 py-0.5 rounded border border-[#E8E9EC]">
                      {lead.opportunity_score}/30
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#98A1B2]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Imports or Audit Activity */}
        <div className="bg-white border border-[#E8E9EC] rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#171717]">Recent Activity</h2>
            <span className="text-xs text-[#98A1B2]">Real audit events</span>
          </div>

          {activities.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#98A1B2]">
              <Clock className="w-5 h-5 mx-auto mb-1 text-[#98A1B2]" />
              <p>No activity recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F3F4F6] max-h-72 overflow-y-auto">
              {activities.slice(0, 6).map((act) => (
                <div key={act.id} className="py-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#171717] capitalize">
                      {act.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-[#98A1B2]">
                      {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] truncate mt-0.5">{act.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <FindLeadsModal
        isOpen={isFindModalOpen}
        onClose={() => setIsFindModalOpen(false)}
        onImport={handleImportFromSerper}
        existingLeads={leads}
      />

      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportFromCsv}
        existingLeads={leads}
      />
    </div>
  );
};
