import React from 'react';
import {
  MapPin,
  Star,
  Globe,
  Phone,
  Clock,
  ArrowLeft,
  ExternalLink,
  Archive,
  RefreshCw,
  Mail,
} from 'lucide-react';
import { Lead, PipelineStage } from '@/src/types/database.ts';
import {
  OpportunityBadge,
  PipelineStageBadge,
  WebsiteStatusBadge,
} from '@/src/components/ui/StatusBadge.tsx';

interface LeadHeaderProps {
  lead: Lead;
  onBack: () => void;
  onStageChange: (newStage: PipelineStage) => void;
  onArchiveToggle: () => void;
  onRecalculateScore: () => void;
}

const PIPELINE_STAGES: PipelineStage[] = [
  'New',
  'Researching',
  'Qualified',
  'Contacted',
  'Replied',
  'Interested',
  'Call Booked',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
  'Not Now',
];

export const LeadHeader: React.FC<LeadHeaderProps> = ({
  lead,
  onBack,
  onStageChange,
  onArchiveToggle,
  onRecalculateScore,
}) => {
  return (
    <div className="bg-white border-b border-[#E8E9EC] py-5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top bar: Back navigation + Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] hover:text-[#171717] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Leads</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#98A1B2] font-mono">
              Source: <span className="capitalize text-[#374151] font-semibold">{lead.source}</span>
            </span>
            <button
              onClick={onArchiveToggle}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#6B7280] hover:text-red-600 bg-white border border-[#E8E9EC] rounded-lg hover:bg-red-50 transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{lead.archived_at ? 'Restore Lead' : 'Archive'}</span>
            </button>
          </div>
        </div>

        {/* Business Title & High-Level Metadata */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight">
                {lead.business_name}
              </h1>
              <OpportunityBadge priority={lead.opportunity_priority} />
              
              {/* Pipeline Stage Select */}
              <div className="relative inline-block">
                <select
                  value={lead.pipeline_stage}
                  onChange={(e) => onStageChange(e.target.value as PipelineStage)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full border border-[#E8E9EC] bg-[#F9FAFB] text-[#171717] cursor-pointer hover:bg-[#F3F4F6] focus:outline-none"
                >
                  {PIPELINE_STAGES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {lead.archived_at && (
                <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 font-medium">
                  Archived
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#6B7280]">
              <div className="flex items-center gap-1 text-[#374151] font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#98A1B2]" />
                <span>{lead.city}, {lead.country}</span>
              </div>
              {lead.category_name && (
                <>
                  <span>•</span>
                  <span className="font-medium text-[#171717]">{lead.category_name}</span>
                </>
              )}
              {lead.google_rating != null && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{lead.google_rating.toFixed(1)}</span>
                    <span className="text-[#6B7280] font-normal">({lead.review_count} reviews)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Opportunity Metric Score Block */}
          <div className="flex items-center gap-4 bg-[#F9FAFB] p-3 rounded-xl border border-[#E8E9EC] self-start lg:self-auto">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280] block">
                Opportunity Score
              </span>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-2xl font-black text-[#E30613]">{lead.opportunity_score}</span>
                <span className="text-xs text-[#6B7280] font-semibold">/30</span>
              </div>
            </div>
            <div className="h-9 w-px bg-[#E8E9EC]" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280] block">
                Digital Presence
              </span>
              <div className="mt-0.5">
                <WebsiteStatusBadge status={lead.website_status} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Contact & Links Bar */}
        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#374151] border-t border-[#F3F4F6]">
          {lead.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#98A1B2]" />
              <a href={`tel:${lead.phone}`} className="hover:text-[#171717] font-mono">
                {lead.phone}
              </a>
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#98A1B2]" />
              <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                {lead.email}
              </a>
            </div>
          )}
          {lead.website_url ? (
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#98A1B2]" />
              <a
                href={lead.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1 truncate max-w-[220px]"
              >
                <span>{lead.website_url.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          ) : (
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
              No standalone website found
            </span>
          )}
          {lead.google_maps_url && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#98A1B2]" />
              <a
                href={lead.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6B7280] hover:text-[#171717] inline-flex items-center gap-1"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

