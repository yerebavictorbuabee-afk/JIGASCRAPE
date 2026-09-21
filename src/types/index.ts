export * from './database.ts';

export type NavRoute =
  | 'dashboard'
  | 'leads'
  | 'opportunities'
  | 'concepts'
  | 'outreach'
  | 'clients'
  | 'analytics'
  | 'settings'
  | 'future'
  | 'lead-workspace';

export interface UserSession {
  user: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    role: 'owner' | 'admin' | 'member';
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export type LeadFilter = {
  search?: string;
  category?: string;
  city?: string;
  stage?: string;
  priority?: string;
  websiteStatus?: string;
};

export type LeadWorkspaceTab =
  | 'overview'
  | 'research'
  | 'analysis'
  | 'concept'
  | 'outreach'
  | 'follow-up'
  | 'notes'
  | 'proposal'
  | 'activity';
