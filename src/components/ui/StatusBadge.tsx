import React from 'react';
import { OpportunityPriority, PipelineStage, WebsiteStatus, ContactStatus } from '@/src/types/database.ts';
import {
  OPPORTUNITY_PRIORITY_STYLES,
  PIPELINE_STAGE_STYLES,
  WEBSITE_STATUS_STYLES,
  CONTACT_STATUS_STYLES,
} from '@/src/lib/constants/config.ts';

export const OpportunityBadge: React.FC<{ priority: OpportunityPriority }> = ({ priority }) => {
  const style = OPPORTUNITY_PRIORITY_STYLES[priority] || OPPORTUNITY_PRIORITY_STYLES['Medium Priority'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {priority}
    </span>
  );
};

export const PipelineStageBadge: React.FC<{ stage: PipelineStage | string }> = ({ stage }) => {
  const style = PIPELINE_STAGE_STYLES[stage] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      {stage}
    </span>
  );
};

export const WebsiteStatusBadge: React.FC<{ status: WebsiteStatus }> = ({ status }) => {
  const style = WEBSITE_STATUS_STYLES[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
};

export const ContactStatusBadge: React.FC<{ status: ContactStatus }> = ({ status }) => {
  const style = CONTACT_STATUS_STYLES[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
};

export const DemoBadge: React.FC<{ className?: string }> = () => {
  return null;
};

