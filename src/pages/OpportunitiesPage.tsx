import React, { useState, useEffect } from 'react';
import {
  CircleCheck,
  ArrowUpRight,
  MapPin,
  Star,
  Globe,
  Flame,
  Filter,
  CheckCircle2,
  ChevronRight,
  Search,
} from 'lucide-react';
import { Lead, PipelineStage, OpportunityPriority } from '@/src/types/database.ts';
import { leadRepository } from '@/src/lib/services/leadRepository.ts';
import { useAuth } from '@/src/context/AuthContext.tsx';
import {
  OpportunityBadge,
  PipelineStageBadge,
  WebsiteStatusBadge,
} from '@/src/components/ui/StatusBadge.tsx';

interface OpportunitiesPageProps {
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

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({ onSelectLead }) => {
  const { session } = useAuth();
  const orgId = session?.user?.organization_id || 'org_default';

  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedTier, setSelectedTier] = useState<'all' | 'high' | 'medium'>('all');
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [bestTargetsOnly, setBestTargetsOnly] = useState(false);

  useEffect(() => {
    loadOpportunities();
  }, [orgId]);

  const loadOpportunities = async () => {
    setIsLoading(true);
    try {
      const res = await leadRepository.getLeads(orgId, { pageSize: 2000, archived: false });
      setAllLeads(res.leads);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageChange = async (leadId: string, nextStage: PipelineStage) => {
    await leadRepository.updateLead(orgId, leadId, { pipeline_stage: nextStage }, session?.user?.id);
    loadOpportunities();
  };

  // Filter for high-intent opportunities:
  // - High priority (>= 20) or Medium priority (>= 15)
  // - OR No Website / Broken Website
  const opportunities = allLeads.filter((l) => {
    const isHighOrMedium = l.opportunity_score >= 15;
    const hasDigitalGap = l.website_status === 'No Website' || l.website_status === 'Broken';
    if (!isHighOrMedium && !hasDigitalGap) return false;

    if (bestTargetsOnly) {
      // Best First Outreach: High priority (>= 20) AND No Website / Broken
      if (l.opportunity_score < 20 || (l.website_status !== 'No Website' && l.website_status !== 'Broken')) {
        return false;
      }
    }

    if (selectedTier === 'high' && l.opportunity_score < 20) return false;
    if (selectedTier === 'medium' && (l.opportunity_score < 15 || l.opportunity_score >= 20)) return false;

    if (selectedNiche !== 'all' && l.category_name !== selectedNiche) return false;
    if (selectedCity !== 'all' && l.city !== selectedCity) return false;

    return true;
  });

  const distinctNiches = Array.from(new Set(allLeads.map((l) => l.category_name).filter(Boolean))) as string[];
  const distinctCities = Array.from(new Set(allLeads.map((l) => l.city).filter(Boolean))) as string[];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E9EC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-[#171717] tracking-tight">Opportunities</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-[#E30613]">
              High Intent
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Target prospects scored 15+ or operating with high-visibility digital gaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6B7280] font-medium">
            {opportunities.length} active opportunities
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 bg-white rounded-xl border border-[#E8E9EC] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setBestTargetsOnly(!bestTargetsOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              bestTargetsOnly
                ? 'bg-[#E30613] text-white border-[#E30613]'
                : 'bg-[#F9FAFB] text-[#374151] border-[#E8E9EC] hover:bg-[#F3F4F6]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Best First Outreach Targets (Score ≥ 20 + No Site)</span>
          </button>

          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E8E9EC] bg-[#F9FAFB] text-[#374151]"
          >
            <option value="all">All Opportunity Tiers</option>
            <option value="high">High Priority (20-30 pts)</option>
            <option value="medium">Medium Priority (15-19 pts)</option>
          </select>

          <select
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E8E9EC] bg-[#F9FAFB] text-[#374151]"
          >
            <option value="all">All Niches</option>
            {distinctNiches.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#E8E9EC] bg-[#F9FAFB] text-[#374151]"
          >
            <option value="all">All Cities</option>
            {distinctCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Opportunity Cards */}
      {opportunities.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E9EC] p-12 text-center max-w-md mx-auto shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-[#E8E9EC] flex items-center justify-center text-[#98A1B2] mx-auto mb-3">
            <CircleCheck className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-[#171717]">No opportunities yet.</h2>
          <p className="text-xs text-[#6B7280] mt-1 mb-4 leading-relaxed">
            As you import and score leads from Serper or CSV, prospects with High and Medium priority will automatically populate this workspace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((lead) => (
            <div
              key={lead.id}
              className="p-4 rounded-xl border border-[#E8E9EC] bg-white hover:border-[#DCDFE4] transition-all shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-[#171717] hover:text-[#E30613] transition-colors cursor-pointer" onClick={() => onSelectLead(lead.id)}>
                      {lead.business_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#98A1B2]" />
                      <span>{lead.city}, {lead.country_code}</span>
                      {lead.category_name && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-[#374151]">{lead.category_name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-baseline gap-0.5 justify-end">
                      <span className="text-xl font-black text-[#E30613]">{lead.opportunity_score}</span>
                      <span className="text-[10px] text-[#98A1B2] font-semibold">/30</span>
                    </div>
                    <OpportunityBadge priority={lead.opportunity_priority} />
                  </div>
                </div>

                {/* Rating & Gap Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <WebsiteStatusBadge status={lead.website_status} />
                  {lead.google_rating != null && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{lead.google_rating.toFixed(1)}</span>
                      <span className="font-normal text-[#6B7280]">({lead.review_count})</span>
                    </div>
                  )}
                </div>

                {lead.business_description && (
                  <p className="text-xs text-[#6B7280] mt-2 line-clamp-2 leading-relaxed">
                    {lead.business_description}
                  </p>
                )}
              </div>

              {/* Bottom Stage Control & Workspace Action */}
              <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between gap-2 text-xs">
                <select
                  value={lead.pipeline_stage}
                  onChange={(e) => handleStageChange(lead.id, e.target.value as PipelineStage)}
                  className="text-xs font-medium px-2 py-1 rounded border border-[#E8E9EC] bg-[#F9FAFB] text-[#374151]"
                >
                  {PIPELINE_STAGES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => onSelectLead(lead.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-[#171717] hover:bg-black text-white font-medium rounded-lg transition-colors"
                >
                  <span>Workspace</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
