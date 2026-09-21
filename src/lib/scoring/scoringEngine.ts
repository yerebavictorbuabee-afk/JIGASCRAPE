import { Lead, LeadScoreSignal, OpportunityPriority } from '@/src/types/database.ts';

export interface ScoreRuleDefinition {
  key: string;
  label: string;
  points: number;
  category: 'presence' | 'experience' | 'conversion' | 'reputation';
  isAutomated: boolean;
  defaultDescription: string;
}

export const SCORE_RULES: ScoreRuleDefinition[] = [
  {
    key: 'no_website',
    label: 'No website found in source',
    points: 5,
    category: 'presence',
    isAutomated: true,
    defaultDescription: 'Business has no verified web address recorded from provider or import.',
  },
  {
    key: 'poor_website',
    label: 'Poor or outdated website',
    points: 4,
    category: 'experience',
    isAutomated: false,
    defaultDescription: 'Website relies on outdated design patterns or slow loading architecture.',
  },
  {
    key: 'poor_mobile',
    label: 'Poor mobile experience',
    points: 4,
    category: 'experience',
    isAutomated: false,
    defaultDescription: 'Site lacks responsive touch targets, mobile viewport scaling, or fast mobile layout.',
  },
  {
    key: 'no_whatsapp_cta',
    label: 'No obvious WhatsApp CTA on website',
    points: 3,
    category: 'conversion',
    isAutomated: false,
    defaultDescription: 'Missing direct floating or header WhatsApp chat widget for Gulf customer conversion.',
  },
  {
    key: 'no_booking_system',
    label: 'No booking or enquiry system',
    points: 3,
    category: 'conversion',
    isAutomated: false,
    defaultDescription: 'Lacks interactive appointment scheduler, service booking portal, or instant quote form.',
  },
  {
    key: 'services_poorly_explained',
    label: 'Services poorly explained',
    points: 2,
    category: 'conversion',
    isAutomated: false,
    defaultDescription: 'Unclear value propositions, missing scope breakdown, or confusing service lists.',
  },
  {
    key: 'no_clear_pricing',
    label: 'No clear packages or pricing',
    points: 2,
    category: 'conversion',
    isAutomated: false,
    defaultDescription: 'No transparent service tiers, starter bundles, or upfront pricing expectations.',
  },
  {
    key: 'weak_visuals',
    label: 'Weak visual presentation',
    points: 2,
    category: 'experience',
    isAutomated: false,
    defaultDescription: 'Low-resolution imagery, generic stock photos, or cluttered visual branding.',
  },
  {
    key: 'strong_rating',
    label: 'Strong Google rating (4.5+)',
    points: 2,
    category: 'reputation',
    isAutomated: true,
    defaultDescription: 'High customer satisfaction rating indicating established commercial demand.',
  },
  {
    key: 'review_count_range',
    label: '50–1,000 reviews',
    points: 2,
    category: 'reputation',
    isAutomated: true,
    defaultDescription: 'Solid customer volume with strong local presence, ideal target profile for conversion upgrade.',
  },
  {
    key: 'active_social_media',
    label: 'Active social media',
    points: 1,
    category: 'presence',
    isAutomated: false,
    defaultDescription: 'Actively posting on Instagram, TikTok, or LinkedIn demonstrating ongoing business marketing.',
  },
];

export const SCORING_RULES = SCORE_RULES;

export const MAX_OPPORTUNITY_SCORE = 30;

export function calculatePriority(score: number): OpportunityPriority {
  if (score >= 20) return 'High Priority';
  if (score >= 15) return 'Medium Priority';
  return 'Low Priority';
}

/**
 * Initializes score signals for a newly created or imported lead.
 * Evaluates automated rules strictly from verified data:
 * - No website found in source (+5)
 * - Strong Google rating >= 4.5 (+2)
 * - 50–1,000 reviews (+2)
 * Remaining manual criteria default to 'unknown' with 0 points.
 */
export function initializeLeadSignals(lead: Partial<Lead>, leadId: string): LeadScoreSignal[] {
  const now = new Date().toISOString();
  const signals: LeadScoreSignal[] = [];

  for (const rule of SCORE_RULES) {
    let status: 'unknown' | 'confirmed' | 'not_present' = 'unknown';
    let source: 'provider' | 'manual' | 'analysis' = 'manual';
    let evidence: string | null = null;

    if (rule.key === 'no_website') {
      source = 'provider';
      const hasWebsite = lead.website_url && lead.website_url.trim().length > 0;
      if (!hasWebsite || lead.website_status === 'No Website') {
        status = 'confirmed';
        evidence = 'Website not found in source provider or import data';
      } else {
        status = 'not_present';
        evidence = `Verified website URL: ${lead.website_url}`;
      }
    } else if (rule.key === 'strong_rating') {
      source = 'provider';
      if (lead.google_rating != null && lead.google_rating >= 4.5) {
        status = 'confirmed';
        evidence = `Verified Google rating of ${lead.google_rating.toFixed(1)}/5.0`;
      } else if (lead.google_rating != null && lead.google_rating > 0) {
        status = 'not_present';
        evidence = `Google rating is ${lead.google_rating.toFixed(1)}/5.0 (below 4.5 threshold)`;
      } else {
        status = 'unknown';
        evidence = 'Rating not available in source data';
      }
    } else if (rule.key === 'review_count_range') {
      source = 'provider';
      const count = lead.review_count ?? 0;
      if (count >= 50 && count <= 1000) {
        status = 'confirmed';
        evidence = `${count} verified customer reviews (within 50–1,000 sweet spot)`;
      } else if (count > 0) {
        status = 'not_present';
        evidence = `${count} customer reviews (outside 50–1,000 range)`;
      } else {
        status = 'unknown';
        evidence = 'Review count not recorded in source';
      }
    }

    signals.push({
      id: `${leadId}_sig_${rule.key}`,
      lead_id: leadId,
      signal_key: rule.key,
      label: rule.label,
      points: rule.points,
      status,
      source,
      evidence,
      confirmed_by: status === 'confirmed' && source === 'provider' ? null : undefined,
      confirmed_at: status === 'confirmed' ? now : undefined,
      created_at: now,
      updated_at: now,
    });
  }

  return signals;
}

/**
 * Calculates total opportunity score and priority from signals.
 * Points are ONLY awarded for 'confirmed' signals.
 */
export function calculateScoreFromSignals(signals: LeadScoreSignal[]): {
  score: number;
  priority: OpportunityPriority;
} {
  let score = 0;
  for (const signal of signals) {
    if (signal.status === 'confirmed') {
      score += signal.points;
    }
  }

  // Cap at MAX_OPPORTUNITY_SCORE
  const finalScore = Math.min(score, MAX_OPPORTUNITY_SCORE);
  return {
    score: finalScore,
    priority: calculatePriority(finalScore),
  };
}
