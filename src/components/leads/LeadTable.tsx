import React from 'react';
import {
  Star,
  Globe,
  Phone,
  ExternalLink,
  ChevronRight,
  Archive,
  ArrowUpDown,
  Building,
} from 'lucide-react';
import { Lead, PipelineStage } from '@/src/types/database.ts';
import {
  OpportunityBadge,
  PipelineStageBadge,
  WebsiteStatusBadge,
} from '@/src/components/ui/StatusBadge.tsx';

interface LeadTableProps {
  leads: Lead[];
  selectedIds: Set<string>;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onSelectLead: (id: string) => void;
  onArchiveLead: (id: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (column: 'created_at' | 'opportunity_score' | 'business_name' | 'google_rating') => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  selectedIds,
  onToggleSelectAll,
  onToggleSelect,
  onSelectLead,
  onArchiveLead,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const isAllSelected = leads.length > 0 && selectedIds.size === leads.length;

  return (
    <div className="border border-[#E8E9EC] rounded-xl overflow-hidden bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E8E9EC] text-[#6B7280] font-medium select-none">
              <th className="p-3 w-9">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-[#E8E9EC] text-[#E30613] focus:ring-[#E30613]"
                />
              </th>

              <th
                className="p-3 cursor-pointer hover:text-[#171717]"
                onClick={() => onSortChange('business_name')}
              >
                <div className="flex items-center gap-1">
                  <span>Business Name</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="p-3">Location</th>
              <th className="p-3">Website Status</th>

              <th
                className="p-3 cursor-pointer hover:text-[#171717]"
                onClick={() => onSortChange('google_rating')}
              >
                <div className="flex items-center gap-1">
                  <span>Rating / Reviews</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="p-3">Phone</th>

              <th
                className="p-3 cursor-pointer hover:text-[#171717]"
                onClick={() => onSortChange('opportunity_score')}
              >
                <div className="flex items-center gap-1">
                  <span>Score & Priority</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              <th className="p-3">Stage</th>
              <th className="p-3">Source</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E8E9EC]">
            {leads.map((lead) => {
              const isSelected = selectedIds.has(lead.id);

              return (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead.id)}
                  className={`cursor-pointer transition-colors group ${
                    isSelected ? 'bg-red-50/25' : 'hover:bg-[#F9FAFB]'
                  }`}
                >
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(lead.id)}
                      className="rounded border-[#E8E9EC] text-[#E30613] focus:ring-[#E30613]"
                    />
                  </td>

                  <td className="p-3">
                    <div className="font-semibold text-[#171717] group-hover:text-[#E30613] transition-colors">
                      {lead.business_name}
                    </div>
                    <div className="text-[11px] text-[#6B7280]">
                      {lead.category_name || 'Commercial Business'}
                    </div>
                  </td>

                  <td className="p-3 text-[#374151]">
                    <span>{lead.city}</span>
                    <span className="text-[#98A1B2] ml-1">({lead.country_code})</span>
                  </td>

                  <td className="p-3">
                    <WebsiteStatusBadge status={lead.website_status} />
                  </td>

                  <td className="p-3">
                    {lead.google_rating != null ? (
                      <div className="flex items-center gap-1 font-medium text-[#171717]">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{lead.google_rating.toFixed(1)}</span>
                        <span className="text-[#6B7280] font-normal">({lead.review_count})</span>
                      </div>
                    ) : (
                      <span className="text-[#98A1B2]">N/A</span>
                    )}
                  </td>

                  <td className="p-3 text-[#374151] font-mono text-[11px]">
                    {lead.phone ? lead.phone : <span className="text-[#98A1B2]">N/A</span>}
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#171717] w-6">
                        {lead.opportunity_score}
                      </span>
                      <OpportunityBadge priority={lead.opportunity_priority} />
                    </div>
                  </td>

                  <td className="p-3">
                    <PipelineStageBadge stage={lead.pipeline_stage} />
                  </td>

                  <td className="p-3">
                    <span className="capitalize text-[11px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-medium">
                      {lead.source}
                    </span>
                  </td>

                  <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onArchiveLead(lead.id)}
                        className="p-1 text-[#6B7280] hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                        title={lead.archived_at ? 'Restore lead' : 'Archive lead'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onSelectLead(lead.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-[#171717] hover:bg-[#F3F4F6] transition-colors"
                      >
                        <span>Workspace</span>
                        <ChevronRight className="w-3 h-3 text-[#6B7280]" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
