import { PipelineStage, OpportunityPriority, WebsiteStatus, ContactStatus } from '@/src/types/database.ts';

export const APP_CONFIG = {
  name: 'Jigaway Gulf Client Acquisition Hub',
  tagline: 'Internal AI-Powered Client Acquisition Operating System',
  organizationDefault: 'Jigaway',
  currencyDefault: 'AED',
  primaryColor: '#DC2626', // Jigaway primary red
};

export const PIPELINE_STAGES: { label: PipelineStage; description: string; step: number }[] = [
  { label: 'New', description: 'Freshly identified Gulf business record', step: 1 },
  { label: 'Researching', description: 'Auditing digital footprint, reviews, and gaps', step: 2 },
  { label: 'Qualified', description: 'High-margin opportunity confirmed', step: 3 },
  { label: 'Concept Created', description: 'Personalized modern website demo ready', step: 4 },
  { label: 'Contacted', description: 'Initial personalized WhatsApp or email dispatched', step: 5 },
  { label: 'Replied', description: 'Prospect engaged with concept preview', step: 6 },
  { label: 'Interested', description: 'Expressed interest in business upgrade', step: 7 },
  { label: 'Call Booked', description: 'Discovery / demonstration call scheduled', step: 8 },
  { label: 'Proposal Sent', description: 'Custom package quote presented', step: 9 },
  { label: 'Negotiation', description: 'Scope and commercial agreement tuning', step: 10 },
  { label: 'Won', description: 'Signed and deposit committed', step: 11 },
  { label: 'Lost', description: 'Disqualified or chose competitor', step: 12 },
  { label: 'Not Now', description: 'Nurture loop for future quarter', step: 13 },
];

export const ACQUISITION_ACTION_HIERARCHY = [
  {
    step: 1,
    id: 'generate_concept',
    name: '1. Generate Free Value',
    description: 'Create a tailored mobile-first concept demo before making initial contact',
    badge: 'Phase 3 Feature',
    icon: 'Sparkles',
  },
  {
    step: 2,
    id: 'contact_prospect',
    name: '2. Contact',
    description: 'Reach out manually via personalized WhatsApp hook or email',
    badge: 'Phase 4 Feature',
    icon: 'Send',
  },
  {
    step: 3,
    id: 'follow_up',
    name: '3. Follow Up',
    description: 'Maintain persistent 3-touch follow-up sequence with value additions',
    badge: 'Phase 4 Feature',
    icon: 'Clock',
  },
  {
    step: 4,
    id: 'create_proposal',
    name: '4. Create Proposal',
    description: 'Send locked service tier proposal with payment terms',
    badge: 'Phase 5 Feature',
    icon: 'FileText',
  },
];

export const OPPORTUNITY_PRIORITY_STYLES: Record<OpportunityPriority, { bg: string; text: string; border: string; dot: string }> = {
  'High Priority': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-600',
  },
  'Medium Priority': {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  'Low Priority': {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
};

export const PIPELINE_STAGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'New': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  'Researching': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Qualified': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Concept Created': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Contacted': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  'Replied': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Interested': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'Call Booked': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Proposal Sent': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Negotiation': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'Won': { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-300' },
  'Lost': { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' },
  'Not Now': { bg: 'bg-zinc-100', text: 'text-zinc-600', border: 'border-zinc-200' },
};

export const WEBSITE_STATUS_STYLES: Record<WebsiteStatus, { label: string; bg: string; text: string }> = {
  'No Website': { label: 'No Website', bg: 'bg-red-100', text: 'text-red-800' },
  'Outdated': { label: 'Outdated (High Opportunity)', bg: 'bg-amber-100', text: 'text-amber-800' },
  'Broken': { label: 'Broken / Unresponsive', bg: 'bg-rose-100', text: 'text-rose-800' },
  'Modern': { label: 'Modern Active', bg: 'bg-emerald-100', text: 'text-emerald-800' },
};

export const CONTACT_STATUS_STYLES: Record<ContactStatus, { label: string; bg: string; text: string }> = {
  'Uncontacted': { label: 'Uncontacted', bg: 'bg-slate-100', text: 'text-slate-700' },
  'Contacted': { label: 'Initial Sent', bg: 'bg-blue-100', text: 'text-blue-700' },
  'Replied': { label: 'Replied', bg: 'bg-green-100', text: 'text-green-800' },
  'Bounced': { label: 'Failed / Bounced', bg: 'bg-red-100', text: 'text-red-700' },
};
