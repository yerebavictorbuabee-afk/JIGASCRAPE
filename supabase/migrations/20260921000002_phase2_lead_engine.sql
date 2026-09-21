-- ==============================================================================
-- Migration: 20260921000002_phase2_lead_engine.sql
-- Description: Phase 2 Lead Engine Database Schema (Imports, Signals, Deduplication Indexes)
-- ==============================================================================

-- 1. Ensure source_external_id on leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS source_external_id TEXT;

-- 2. Create lead_imports table
CREATE TABLE IF NOT EXISTS public.lead_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    source TEXT NOT NULL DEFAULT 'csv',
    file_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    total_rows INTEGER NOT NULL DEFAULT 0,
    imported_count INTEGER NOT NULL DEFAULT 0,
    updated_count INTEGER NOT NULL DEFAULT 0,
    skipped_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_summary TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 3. Create lead_score_signals table
CREATE TABLE IF NOT EXISTS public.lead_score_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    signal_key TEXT NOT NULL,
    label TEXT NOT NULL,
    points INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'unknown', -- 'unknown', 'confirmed', 'not_present'
    source TEXT NOT NULL DEFAULT 'provider', -- 'provider', 'manual', 'analysis'
    evidence TEXT,
    confirmed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_lead_signal UNIQUE (lead_id, signal_key)
);

-- 4. Deduplication and Query Indexes
CREATE INDEX IF NOT EXISTS idx_leads_org_source_ext ON public.leads(organization_id, source, source_external_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_normalized_phone ON public.leads(organization_id, normalized_phone);
CREATE INDEX IF NOT EXISTS idx_leads_org_website_url ON public.leads(organization_id, website_url);
CREATE INDEX IF NOT EXISTS idx_leads_org_name_city ON public.leads(organization_id, business_name, city);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage ON public.leads(organization_id, pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_leads_opportunity_score ON public.leads(organization_id, opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_opportunity_priority ON public.leads(organization_id, opportunity_priority);
CREATE INDEX IF NOT EXISTS idx_lead_score_signals_lead ON public.lead_score_signals(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_imports_org ON public.lead_imports(organization_id);

-- 5. Row Level Security (RLS)
ALTER TABLE public.lead_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_score_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_imports_org_isolation" ON public.lead_imports
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "lead_score_signals_org_isolation" ON public.lead_score_signals
    FOR ALL
    USING (
        lead_id IN (
            SELECT l.id FROM public.leads l
            JOIN public.profiles p ON p.organization_id = l.organization_id
            WHERE p.id = auth.uid()
        )
    );
