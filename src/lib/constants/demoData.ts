import { Organization, Profile, Market, BusinessCategory, ServicePackage, Lead } from '@/src/types/database.ts';

export const DEMO_ORGANIZATION: Organization = {
  id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  name: 'Jigaway',
  slug: 'jigaway',
  created_at: '2026-09-01T08:00:00Z',
  updated_at: '2026-09-01T08:00:00Z',
};

export const DEMO_PROFILE: Profile = {
  id: 'f1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c',
  organization_id: DEMO_ORGANIZATION.id,
  full_name: 'Tariq Al-Mansoor',
  email: 'tariq@jigaway.com',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'owner',
  created_at: '2026-09-01T08:00:00Z',
  updated_at: '2026-09-01T08:00:00Z',
};

export const DEMO_MARKETS: Market[] = [
  { id: 'b0000001-0000-0000-0000-000000000001', organization_id: DEMO_ORGANIZATION.id, country: 'United Arab Emirates', country_code: 'AE', city: 'Dubai', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'b0000001-0000-0000-0000-000000000002', organization_id: DEMO_ORGANIZATION.id, country: 'United Arab Emirates', country_code: 'AE', city: 'Abu Dhabi', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'b0000001-0000-0000-0000-000000000003', organization_id: DEMO_ORGANIZATION.id, country: 'United Arab Emirates', country_code: 'AE', city: 'Sharjah', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'b0000001-0000-0000-0000-000000000004', organization_id: DEMO_ORGANIZATION.id, country: 'Saudi Arabia', country_code: 'SA', city: 'Riyadh', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'b0000001-0000-0000-0000-000000000005', organization_id: DEMO_ORGANIZATION.id, country: 'Saudi Arabia', country_code: 'SA', city: 'Jeddah', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
];

export const DEMO_CATEGORIES: BusinessCategory[] = [
  { id: 'c0000001-0000-0000-0000-000000000001', organization_id: DEMO_ORGANIZATION.id, name: 'Car Detailing / Auto Care', slug: 'car-detailing-auto-care', description: 'Automotive detailing, ceramic coating, paint protection, and tinting', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'c0000001-0000-0000-0000-000000000002', organization_id: DEMO_ORGANIZATION.id, name: 'Barbers', slug: 'barbers', description: 'Men grooming, luxury barber shops, styling lounges', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'c0000001-0000-0000-0000-000000000003', organization_id: DEMO_ORGANIZATION.id, name: 'Salons', slug: 'salons', description: 'Hair salons, ladies beauty centers, spa lounges', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'c0000001-0000-0000-0000-000000000004', organization_id: DEMO_ORGANIZATION.id, name: 'Restaurants', slug: 'restaurants', description: 'Casual dining, fine dining, bistros, and specialty cafes', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'c0000001-0000-0000-0000-000000000005', organization_id: DEMO_ORGANIZATION.id, name: 'Clinics', slug: 'clinics', description: 'Dental clinics, aesthetic clinics, physiotherapy, healthcare', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'c0000001-0000-0000-0000-000000000006', organization_id: DEMO_ORGANIZATION.id, name: 'Real Estate', slug: 'real-estate', description: 'Boutique real estate brokers, property management agencies', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'c0000001-0000-0000-0000-000000000007', organization_id: DEMO_ORGANIZATION.id, name: 'Cleaning Services', slug: 'cleaning-services', description: 'Residential deep cleaning, commercial sanitization', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'c0000001-0000-0000-0000-000000000008', organization_id: DEMO_ORGANIZATION.id, name: 'Landscaping', slug: 'landscaping', description: 'Garden design, pool maintenance, villa landscaping', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'c0000001-0000-0000-0000-000000000009', organization_id: DEMO_ORGANIZATION.id, name: 'Gyms', slug: 'gyms', description: 'Fitness centers, boutique CrossFit boxes, personal training', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'c0000001-0000-0000-0000-000000000010', organization_id: DEMO_ORGANIZATION.id, name: 'Beauty Businesses', slug: 'beauty-businesses', description: 'Nail studios, laser hair removal clinics, brow & lash studios', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'c0000001-0000-0000-0000-000000000011', organization_id: DEMO_ORGANIZATION.id, name: 'Automotive', slug: 'automotive', description: 'Garages, auto performance tuning, tire & battery services', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'c0000001-0000-0000-0000-000000000012', organization_id: DEMO_ORGANIZATION.id, name: 'Hotels', slug: 'hotels', description: 'Boutique hotels, serviced apartments, resort retreats', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'c0000001-0000-0000-0000-000000000013', organization_id: DEMO_ORGANIZATION.id, name: 'Construction', slug: 'construction', description: 'Fit-out contractors, interior design, renovation specialists', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'c0000001-0000-0000-0000-000000000014', organization_id: DEMO_ORGANIZATION.id, name: 'Home Services', slug: 'home-services', description: 'AC maintenance, plumbing, electrical emergency specialists', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
  { id: 'c0000001-0000-0000-0000-000000000015', organization_id: DEMO_ORGANIZATION.id, name: 'Professional Services', slug: 'professional-services', description: 'Corporate business setup, accounting firms, PRO services', is_active: true, created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-01T08:00:00Z' },
];

export const DEMO_SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'd0000001-0000-0000-0000-000000000001',
    organization_id: DEMO_ORGANIZATION.id,
    name: 'Website Foundation',
    description: 'High-converting single-page or 3-page brand showcase optimized for instant WhatsApp bookings.',
    price_min: 4500,
    price_max: 7500,
    currency: 'AED',
    features: ['Custom Modern UI/UX', 'WhatsApp Instant Booking Button', 'Google Maps & Review Sync', 'Mobile Speed Optimization', 'Bilingual EN/AR Ready'],
    estimated_timeline: '7-10 days',
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'd0000001-0000-0000-0000-000000000002',
    organization_id: DEMO_ORGANIZATION.id,
    name: 'Growth Website',
    description: 'Multi-page commercial website with automated booking inquiry workflows, service catalog, and lead capture.',
    price_min: 9000,
    price_max: 15000,
    currency: 'AED',
    features: ['Up to 8 Custom Pages', 'Lead Capture Engine', 'WhatsApp CRM Routing', 'Local SEO Structured Schema', 'Speed Score 95+'],
    estimated_timeline: '14-21 days',
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'd0000001-0000-0000-0000-000000000003',
    organization_id: DEMO_ORGANIZATION.id,
    name: 'Business Growth System',
    description: 'Comprehensive digital presence overhaul including custom platform, customer booking portal, and automated reviews engine.',
    price_min: 18000,
    price_max: 32000,
    currency: 'AED',
    features: ['Bespoke Web Platform', 'Client Self-Service Portal', 'Automated Review Generation', 'Meta Ads Landing Pages', 'Priority SLA Support'],
    estimated_timeline: '30-45 days',
    is_active: true,
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-09-01T08:00:00Z',
  },
];

// Leads repository initialized empty for Phase 1 minimal foundation
export const DEMO_LEADS: Lead[] = [];

