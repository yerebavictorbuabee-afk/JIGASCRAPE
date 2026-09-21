import React from 'react';
import {
  Users,
  CircleCheck,
  Send,
  BadgeCheck,
  LayoutTemplate,
  MessageSquare,
  PhoneCall,
  FileText,
  TrendingUp,
  Banknote,
} from 'lucide-react';
import { DEMO_LEADS } from '@/src/lib/constants/demoData.ts';

export const KpiCards: React.FC = () => {
  const totalLeads = DEMO_LEADS.length;
  const qualifiedLeads = DEMO_LEADS.filter((l) => l.pipeline_stage === 'Qualified').length;
  const conceptsGenerated = DEMO_LEADS.filter((l) => l.concept_status !== 'Not Started').length;
  const contactedLeads = DEMO_LEADS.filter((l) => l.contact_status !== 'Uncontacted').length;
  const replies = DEMO_LEADS.filter((l) => l.contact_status === 'Replied').length;
  const callsBooked = DEMO_LEADS.filter((l) => l.pipeline_stage === 'Call Booked').length;
  const proposalsSent = DEMO_LEADS.filter((l) => l.pipeline_stage === 'Proposal Sent').length;
  const won = DEMO_LEADS.filter((l) => l.pipeline_stage === 'Won').length;

  const primaryKpis = [
    { label: 'Total Leads', value: totalLeads, icon: Users },
    { label: 'Qualified', value: qualifiedLeads, icon: CircleCheck },
    { label: 'Contacted', value: contactedLeads, icon: Send },
    { label: 'Won', value: won, icon: BadgeCheck },
  ];

  const secondaryKpis = [
    { label: 'Concepts', value: conceptsGenerated, icon: LayoutTemplate },
    { label: 'Replies', value: replies, icon: MessageSquare },
    { label: 'Calls', value: callsBooked, icon: PhoneCall },
    { label: 'Proposals', value: proposalsSent, icon: FileText },
    { label: 'Pipeline Value', value: 'AED 0', icon: TrendingUp },
    { label: 'Revenue', value: 'AED 0', icon: Banknote },
  ];

  return (
    <div className="bg-white border border-[#E8E9EC] rounded-lg overflow-hidden">
      {/* Primary Metrics: 4-Column Grid with vertical/horizontal dividers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E9EC]">
        {primaryKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#6B7280]">{kpi.label}</span>
                <Icon className="w-4 h-4 text-[#98A1B2] stroke-[1.75]" />
              </div>
              <div className="mt-2 text-2xl sm:text-[28px] font-semibold text-[#171717] tracking-tight">
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Metrics: Smaller compact inline summary row */}
      <div className="bg-[#F7F7F8] border-t border-[#E8E9EC] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E9EC]">
        {secondaryKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="px-4 py-3">
              <div className="flex items-center gap-1.5 text-[#6B7280]">
                <Icon className="w-3.5 h-3.5 text-[#98A1B2] stroke-[1.75]" />
                <span className="text-xs truncate">{kpi.label}</span>
              </div>
              <div className="mt-1 text-sm font-semibold text-[#171717]">
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

