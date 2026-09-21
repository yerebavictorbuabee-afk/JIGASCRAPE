import React from 'react';
import { DEMO_LEADS } from '@/src/lib/constants/demoData.ts';

interface PipelineStageItem {
  id: string;
  name: string;
  count: number;
}

export const AcquisitionFunnel: React.FC = () => {
  const totalLeads = DEMO_LEADS.filter((l) => l.pipeline_stage === 'New').length;
  const qualified = DEMO_LEADS.filter((l) => l.pipeline_stage === 'Qualified').length;
  const concepts = DEMO_LEADS.filter((l) => l.concept_status !== 'Not Started').length;
  const contacted = DEMO_LEADS.filter((l) => l.contact_status !== 'Uncontacted').length;
  const replied = DEMO_LEADS.filter((l) => l.contact_status === 'Replied').length;
  const calls = DEMO_LEADS.filter((l) => l.pipeline_stage === 'Call Booked').length;
  const proposals = DEMO_LEADS.filter((l) => l.pipeline_stage === 'Proposal Sent').length;
  const won = DEMO_LEADS.filter((l) => l.pipeline_stage === 'Won').length;

  const stages: PipelineStageItem[] = [
    { id: 'new', name: 'New', count: totalLeads },
    { id: 'qualified', name: 'Qualified', count: qualified },
    { id: 'concept', name: 'Concept', count: concepts },
    { id: 'contacted', name: 'Contacted', count: contacted },
    { id: 'replied', name: 'Replied', count: replied },
    { id: 'call', name: 'Call', count: calls },
    { id: 'proposal', name: 'Proposal', count: proposals },
    { id: 'won', name: 'Won', count: won },
  ];

  return (
    <div className="bg-white border border-[#E8E9EC] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#171717]">Pipeline</h2>
        <span className="text-xs text-[#98A1B2]">8 stages</span>
      </div>

      {/* Horizontal Stage Progression */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-2">
        {stages.map((stage, idx) => (
          <div key={stage.id} className="relative flex flex-col justify-between py-1">
            <div>
              <div className="text-xs font-medium text-[#6B7280] truncate">
                {stage.name}
              </div>
              <div className="text-xl font-semibold text-[#171717] mt-1 tracking-tight">
                {stage.count}
              </div>
            </div>

            {/* Connecting baseline indicator */}
            <div className="mt-3 flex items-center gap-1">
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${
                  stage.count > 0 ? 'bg-[#E30613]' : 'bg-[#E8E9EC]'
                }`}
              />
              {idx < stages.length - 1 && (
                <span className="hidden lg:block w-1 h-1 rounded-full bg-[#E8E9EC] shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

