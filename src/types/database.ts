/**
 * Database Types for Jigaway Gulf Client Acquisition Hub (Phase 1)
 * Aligned with PostgreSQL / Supabase schema (20260921000001_initial_schema.sql)
 */

export type UUID = string;

export interface Organization {
  id: UUID;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: UUID;
  organization_id: UUID;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
  updated_at: string;
}

export interface Market {
  id: UUID;
  organization_id: UUID;
  country: string;
  country_code: string;
  city: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessCategory {
  id: UUID;
  organization_id: UUID;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PipelineStage =
  | 'New'
  | 'Researching'
  | 'Qualified'
  | 'Concept Created'
  | 'Contacted'
  | 'Replied'
  | 'Interested'
  | 'Call Booked'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost'
  | 'Not Now';

export type OpportunityPriority =
  | 'High Priority'
  | 'Medium Priority'
  | 'Low Priority';

export type WebsiteStatus = 'No Website' | 'Outdated' | 'Broken' | 'Modern';
export type ContactStatus = 'Uncontacted' | 'Contacted' | 'Replied' | 'Bounced';
export type ConceptStatus = 'Not Started' | 'Drafted' | 'Approved' | 'Shared';

export interface Lead {
  id: UUID;
  organization_id: UUID;
  business_name: string;
  business_category_id?: UUID | null;
  category_name?: string; // hydrated from category
  country: string;
  country_code: string;
  city: string;
  address?: string | null;
  phone?: string | null;
  normalized_phone?: string | null;
  email?: string | null;
  website_url?: string | null;
  google_maps_url?: string | null;
  google_rating?: number | null;
  review_count: number;
  opening_hours?: Record<string, string> | null;
  business_description?: string | null;
  logo_url?: string | null;
  source: string;
  source_external_id?: string | null;
  source_metadata?: Record<string, unknown> | null;
  pipeline_stage: PipelineStage;
  opportunity_score: number;
  opportunity_priority: OpportunityPriority;
  website_status: WebsiteStatus;
  contact_status: ContactStatus;
  concept_status: ConceptStatus;
  last_contacted_at?: string | null;
  next_follow_up_at?: string | null;
  owner_id?: UUID | null;
  score_signals?: LeadScoreSignal[];
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
}

export type ScoreSignalStatus = 'unknown' | 'confirmed' | 'not_present';
export type ScoreSignalSource = 'provider' | 'manual' | 'analysis';

export interface LeadScoreSignal {
  id: UUID;
  lead_id: UUID;
  signal_key: string;
  label: string;
  points: number;
  status: ScoreSignalStatus;
  source: ScoreSignalSource;
  evidence?: string | null;
  confirmed_by?: UUID | null;
  confirmed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadImport {
  id: UUID;
  organization_id: UUID;
  source: string;
  file_name: string;
  status: 'pending' | 'completed' | 'failed';
  total_rows: number;
  imported_count: number;
  updated_count: number;
  skipped_count: number;
  failed_count: number;
  mapping: Record<string, string>;
  error_summary?: string | null;
  created_by?: UUID | null;
  created_at: string;
  completed_at?: string | null;
}

export interface LeadSocialProfile {
  id: UUID;
  lead_id: UUID;
  platform: 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'twitter';
  profile_url: string;
  handle?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadAnalysis {
  id: UUID;
  lead_id: UUID;
  analysis_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  website_score?: number | null;
  strengths: string[];
  digital_gaps: string[];
  opportunity_summary?: string | null;
  recommendations: string[];
  raw_data?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: UUID;
  organization_id: UUID;
  lead_id: UUID;
  actor_id?: UUID | null;
  activity_type: string;
  title: string;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  occurred_at: string;
  created_at: string;
}

export interface LeadNote {
  id: UUID;
  lead_id: UUID;
  author_id?: UUID | null;
  author_name?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Concept {
  id: UUID;
  organization_id: UUID;
  lead_id: UUID;
  title: string;
  status: 'draft' | 'ready' | 'sent' | 'archived';
  design_direction?: string | null;
  public_token?: string | null;
  public_enabled: boolean;
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
}

export interface ConceptVersion {
  id: UUID;
  concept_id: UUID;
  version_number: number;
  prompt?: string | null;
  content_json?: Record<string, unknown> | null;
  preview_html?: string | null;
  screenshot_url?: string | null;
  created_by?: UUID | null;
  created_at: string;
}

export interface OutreachMessage {
  id: UUID;
  lead_id: UUID;
  channel: 'whatsapp' | 'email' | 'sms';
  message_type: 'first_contact' | 'follow_up_1' | 'follow_up_2' | 'custom';
  subject?: string | null;
  body: string;
  status: 'draft' | 'ready' | 'sent' | 'delivered' | 'replied' | 'failed';
  generated_by_ai: boolean;
  sent_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FollowUpTask {
  id: UUID;
  lead_id: UUID;
  outreach_message_id?: UUID | null;
  due_at: string;
  sequence_number: number;
  status: 'pending' | 'completed' | 'skipped' | 'cancelled';
  notes?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServicePackage {
  id: UUID;
  organization_id: UUID;
  name: string;
  description?: string | null;
  price_min: number;
  price_max: number;
  currency: string;
  features: string[];
  estimated_timeline?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: UUID;
  organization_id: UUID;
  lead_id: UUID;
  proposal_number: string;
  title: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined';
  currency: string;
  total_value: number;
  content_json?: Record<string, unknown> | null;
  public_token?: string | null;
  sent_at?: string | null;
  accepted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: UUID;
  organization_id: UUID;
  lead_id?: UUID | null;
  business_name: string;
  primary_contact_name?: string | null;
  primary_contact_email?: string | null;
  primary_contact_phone?: string | null;
  contract_status: 'pending' | 'active' | 'completed' | 'paused';
  payment_status: 'pending' | 'deposit_paid' | 'fully_paid';
  project_value: number;
  currency: string;
  start_date?: string | null;
  delivery_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: UUID;
  client_id: UUID;
  name: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed';
  value: number;
  currency: string;
  services: string[];
  start_date?: string | null;
  delivery_date?: string | null;
  created_at: string;
  updated_at: string;
}
