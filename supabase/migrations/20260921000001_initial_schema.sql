-- ==============================================================================
-- Migration: 20260921000001_initial_schema.sql
-- Description: Core Schema for Jigaway Gulf Client Acquisition Hub (Phase 1)
-- Database: PostgreSQL / Supabase
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. ORGANIZATIONS & PROFILES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 2. MARKETS & CONFIGURATION FOUNDATIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.markets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    country TEXT NOT NULL,
    country_code VARCHAR(10) NOT NULL, -- e.g. 'AE', 'SA'
    city TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.business_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_categories_org_slug UNIQUE (organization_id, slug)
);

-- ==============================================================================
-- 3. LEAD FOUNDATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_category_id UUID REFERENCES public.business_categories(id) ON DELETE SET NULL,
    country TEXT NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    normalized_phone TEXT,
    email TEXT,
    website_url TEXT,
    google_maps_url TEXT, -- populated if returned by Serper
    google_rating NUMERIC(3, 2),
    review_count INTEGER DEFAULT 0,
    opening_hours JSONB DEFAULT '{}'::jsonb,
    business_description TEXT,
    logo_url TEXT,
    source TEXT DEFAULT 'manual', -- 'serper', 'manual', 'csv_import', etc.
    source_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Pipeline & Status
    pipeline_stage TEXT NOT NULL DEFAULT 'New',
    opportunity_score INTEGER DEFAULT 0, -- 0-100 calculated opportunity index
    opportunity_priority TEXT NOT NULL DEFAULT 'Medium Priority', -- 'High Priority', 'Medium Priority', 'Low Priority'
    website_status TEXT DEFAULT 'Outdated', -- 'No Website', 'Outdated', 'Broken', 'Modern'
    contact_status TEXT DEFAULT 'Uncontacted', -- 'Uncontacted', 'Contacted', 'Replied', 'Bounced'
    concept_status TEXT DEFAULT 'Not Started', -- 'Not Started', 'Drafted', 'Approved', 'Shared'
    
    -- Workflow dates
    last_contacted_at TIMESTAMPTZ,
    next_follow_up_at TIMESTAMPTZ,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);

-- ==============================================================================
-- 4. FUTURE WORKFLOW FOUNDATION TABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.lead_social_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- 'instagram', 'linkedin', 'facebook', 'tiktok', 'twitter'
    profile_url TEXT NOT NULL,
    handle TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lead_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL DEFAULT 'website_audit',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    website_score INTEGER,
    strengths JSONB DEFAULT '[]'::jsonb,
    digital_gaps JSONB DEFAULT '[]'::jsonb,
    opportunity_summary TEXT,
    recommendations JSONB DEFAULT '[]'::jsonb,
    raw_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL, -- 'lead_created', 'stage_change', 'outreach_sent', 'note_added', 'concept_generated'
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lead_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.concepts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'ready', 'sent', 'archived'
    design_direction TEXT,
    public_token TEXT UNIQUE,
    public_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.concept_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    prompt TEXT,
    content_json JSONB DEFAULT '{}'::jsonb,
    preview_html TEXT,
    screenshot_url TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_concept_version UNIQUE (concept_id, version_number)
);

CREATE TABLE IF NOT EXISTS public.outreach_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    channel TEXT NOT NULL, -- 'whatsapp', 'email', 'sms'
    message_type TEXT NOT NULL DEFAULT 'first_contact', -- 'first_contact', 'follow_up_1', 'follow_up_2', 'custom'
    subject TEXT,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'ready', 'sent', 'delivered', 'replied', 'failed'
    generated_by_ai BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.follow_up_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    outreach_message_id UUID REFERENCES public.outreach_messages(id) ON DELETE SET NULL,
    due_at TIMESTAMPTZ NOT NULL,
    sequence_number INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'skipped', 'cancelled'
    notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price_min NUMERIC(10, 2) NOT NULL,
    price_max NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'AED',
    features JSONB DEFAULT '[]'::jsonb,
    estimated_timeline TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    proposal_number TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'viewed', 'accepted', 'declined'
    currency VARCHAR(10) NOT NULL DEFAULT 'AED',
    total_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    content_json JSONB DEFAULT '{}'::jsonb,
    public_token TEXT UNIQUE,
    sent_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    business_name TEXT NOT NULL,
    primary_contact_name TEXT,
    primary_contact_email TEXT,
    primary_contact_phone TEXT,
    contract_status TEXT NOT NULL DEFAULT 'active', -- 'pending', 'active', 'completed', 'paused'
    payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'deposit_paid', 'fully_paid'
    project_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'AED',
    start_date DATE,
    delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'planning', -- 'planning', 'in_progress', 'review', 'completed'
    value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'AED',
    services JSONB DEFAULT '[]'::jsonb,
    start_date DATE,
    delivery_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. INDEXES FOR HIGH-PERFORMANCE FILTERING
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON public.leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_city_country ON public.leads(country_code, city);
CREATE INDEX IF NOT EXISTS idx_leads_category ON public.leads(business_category_id);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage ON public.leads(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_leads_opportunity_score ON public.leads(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_opportunity_priority ON public.leads(opportunity_priority);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON public.leads(next_follow_up_at);
CREATE INDEX IF NOT EXISTS idx_leads_contact_status ON public.leads(contact_status);
CREATE INDEX IF NOT EXISTS idx_leads_concept_status ON public.leads(concept_status);

CREATE INDEX IF NOT EXISTS idx_concepts_public_token ON public.concepts(public_token) WHERE public_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_proposals_public_token ON public.proposals(public_token) WHERE public_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON public.lead_activities(lead_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_due ON public.follow_up_tasks(due_at, status);

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concept_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Helper function to retrieve authenticated user's organization_id
CREATE OR REPLACE FUNCTION public.current_user_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Users can see and edit their own profile or profiles in same organization
CREATE POLICY "Users can view own profile and colleagues" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR organization_id = public.current_user_org_id());

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Organizations: Authenticated users can view their own organization
CREATE POLICY "Users can view their organization" ON public.organizations
    FOR SELECT USING (id = public.current_user_org_id());

-- Standard Organization-Scoped Policies for business data
CREATE POLICY "Org members can view markets" ON public.markets
    FOR ALL USING (organization_id = public.current_user_org_id());

CREATE POLICY "Org members can view categories" ON public.business_categories
    FOR ALL USING (organization_id = public.current_user_org_id());

CREATE POLICY "Org members can access leads" ON public.leads
    FOR ALL USING (organization_id = public.current_user_org_id());

CREATE POLICY "Org members can access lead social profiles" ON public.lead_social_profiles
    FOR ALL USING (lead_id IN (SELECT id FROM public.leads WHERE organization_id = public.current_user_org_id()));

CREATE POLICY "Org members can access lead analyses" ON public.lead_analyses
    FOR ALL USING (lead_id IN (SELECT id FROM public.leads WHERE organization_id = public.current_user_org_id()));

CREATE POLICY "Org members can access lead activities" ON public.lead_activities
    FOR ALL USING (organization_id = public.current_user_org_id());

CREATE POLICY "Org members can access lead notes" ON public.lead_notes
    FOR ALL USING (lead_id IN (SELECT id FROM public.leads WHERE organization_id = public.current_user_org_id()));

CREATE POLICY "Org members can access concepts" ON public.concepts
    FOR ALL USING (organization_id = public.current_user_org_id());

-- Public concept sharing token policy: Read-only access for anyone with public_token enabled
CREATE POLICY "Public read-only access for valid concept token" ON public.concepts
    FOR SELECT USING (public_enabled = TRUE AND public_token IS NOT NULL);

CREATE POLICY "Org members can access concept versions" ON public.concept_versions
    FOR ALL USING (concept_id IN (SELECT id FROM public.concepts WHERE organization_id = public.current_user_org_id()));

CREATE POLICY "Org members can access outreach messages" ON public.outreach_messages
    FOR ALL USING (lead_id IN (SELECT id FROM public.leads WHERE organization_id = public.current_user_org_id()));

CREATE POLICY "Org members can access follow up tasks" ON public.follow_up_tasks
    FOR ALL USING (lead_id IN (SELECT id FROM public.leads WHERE organization_id = public.current_user_org_id()));

CREATE POLICY "Org members can access service packages" ON public.service_packages
    FOR ALL USING (organization_id = public.current_user_org_id());

CREATE POLICY "Org members can access proposals" ON public.proposals
    FOR ALL USING (organization_id = public.current_user_org_id());

-- Public proposal sharing token policy: Read-only access for anyone with public_token
CREATE POLICY "Public read-only access for valid proposal token" ON public.proposals
    FOR SELECT USING (public_token IS NOT NULL);

CREATE POLICY "Org members can access clients" ON public.clients
    FOR ALL USING (organization_id = public.current_user_org_id());

CREATE POLICY "Org members can access projects" ON public.projects
    FOR ALL USING (client_id IN (SELECT id FROM public.clients WHERE organization_id = public.current_user_org_id()));
