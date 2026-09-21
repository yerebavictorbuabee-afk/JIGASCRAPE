-- ==============================================================================
-- Seed: seed.sql
-- Description: Seed Data for Jigaway Gulf Client Acquisition Hub (Phase 1)
-- ==============================================================================

-- 1. Create Organization: Jigaway
INSERT INTO public.organizations (id, name, slug)
VALUES (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'Jigaway',
    'jigaway'
) ON CONFLICT (slug) DO NOTHING;

-- 2. Seed Initial Markets (UAE and Saudi Arabia)
INSERT INTO public.markets (id, organization_id, country, country_code, city, is_active)
VALUES
    ('b0000001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'United Arab Emirates', 'AE', 'Dubai', TRUE),
    ('b0000001-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'United Arab Emirates', 'AE', 'Abu Dhabi', TRUE),
    ('b0000001-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'United Arab Emirates', 'AE', 'Sharjah', TRUE),
    ('b0000001-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Saudi Arabia', 'SA', 'Riyadh', TRUE),
    ('b0000001-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Saudi Arabia', 'SA', 'Jeddah', TRUE)
ON CONFLICT DO NOTHING;

-- 3. Seed Initial Business Categories
INSERT INTO public.business_categories (id, organization_id, name, slug, description, is_active)
VALUES
    ('c0000001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Car Detailing / Auto Care', 'car-detailing-auto-care', 'Automotive detailing, ceramic coating, paint protection, and tinting services', TRUE),
    ('c0000001-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Barbers', 'barbers', 'Men grooming, luxury barber shops, styling lounges', TRUE),
    ('c0000001-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Salons', 'salons', 'Hair salons, ladies beauty centers, spa lounges', TRUE),
    ('c0000001-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Restaurants', 'restaurants', 'Casual dining, fine dining, bistros, and specialty cafes', TRUE),
    ('c0000001-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Clinics', 'clinics', 'Dental clinics, aesthetic clinics, physiotherapy, private healthcare', TRUE),
    ('c0000001-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Real Estate', 'real-estate', 'Boutique real estate brokers, property management agencies', TRUE),
    ('c0000001-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Cleaning Services', 'cleaning-services', 'Residential deep cleaning, commercial sanitization, upholstery cleaning', TRUE),
    ('c0000001-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Landscaping', 'landscaping', 'Garden design, pool maintenance, villa landscaping contractors', TRUE),
    ('c0000001-0000-0000-0000-000000000009', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Gyms', 'gyms', 'Fitness centers, boutique CrossFit boxes, personal training studios', TRUE),
    ('c0000001-0000-0000-0000-000000000010', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Beauty Businesses', 'beauty-businesses', 'Nail studios, laser hair removal clinics, brow & lash studios', TRUE),
    ('c0000001-0000-0000-0000-000000000011', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Automotive', 'automotive', 'Garages, auto performance tuning, tire & battery services', TRUE),
    ('c0000001-0000-0000-0000-000000000012', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Hotels', 'hotels', 'Boutique hotels, serviced apartments, resort retreats', TRUE),
    ('c0000001-0000-0000-0000-000000000013', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Construction', 'construction', 'Fit-out contractors, interior design, renovation specialists', TRUE),
    ('c0000001-0000-0000-0000-000000000014', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Home Services', 'home-services', 'AC maintenance, plumbing, electrical emergency specialists', TRUE),
    ('c0000001-0000-0000-0000-000000000015', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Professional Services', 'professional-services', 'Corporate business setup, accounting firms, PRO services', TRUE)
ON CONFLICT DO NOTHING;

-- 4. Seed Initial Service Packages
INSERT INTO public.service_packages (id, organization_id, name, description, price_min, price_max, currency, features, estimated_timeline, is_active)
VALUES
    (
        'd0000001-0000-0000-0000-000000000001',
        'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
        'Website Foundation',
        'High-converting single-page or 3-page modern brand showcase optimized for mobile WhatsApp conversions.',
        4500.00,
        7500.00,
        'AED',
        '["Custom Modern UI/UX", "WhatsApp Instant Booking Button", "Google Maps & Review Sync", "Mobile Speed Optimization", "Bilingual EN/AR Ready"]'::jsonb,
        '7-10 days',
        TRUE
    ),
    (
        'd0000001-0000-0000-0000-000000000002',
        'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
        'Growth Website',
        'Multi-page commercial website with automated booking inquiry workflows, service catalog, and lead capture.',
        9000.00,
        15000.00,
        'AED',
        '["Up to 8 Custom Pages", "Lead Capture Engine", "WhatsApp CRM Routing", "Local SEO Structured Schema", "Speed Score 95+"]'::jsonb,
        '14-21 days',
        TRUE
    ),
    (
        'd0000001-0000-0000-0000-000000000003',
        'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
        'Business Growth System',
        'Comprehensive digital presence overhaul including custom platform, customer booking portal, and automated reviews engine.',
        18000.00,
        32000.00,
        'AED',
        '["Bespoke Web Platform", "Client Self-Service Portal", "Automated Review Generation", "Meta Ads Landing Pages", "Priority SLA Support"]'::jsonb,
        '30-45 days',
        TRUE
    )
ON CONFLICT DO NOTHING;
