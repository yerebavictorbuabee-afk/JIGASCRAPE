import { Lead } from '@/src/types/database.ts';

export function normalizePhoneNumber(phone?: string | null): string {
  if (!phone) return '';
  // Remove all non-digits except a leading +
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';
  return hasPlus ? `+${digits}` : digits;
}

export function normalizeHostname(url?: string | null): string {
  if (!url) return '';
  let cleaned = url.trim().toLowerCase();
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }
  try {
    const parsed = new URL(cleaned);
    let hostname = parsed.hostname;
    if (hostname.startsWith('www.')) {
      hostname = hostname.slice(4);
    }
    return hostname;
  } catch {
    // Fallback regex if malformed URL
    return cleaned
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .split('?')[0];
  }
}

export function normalizeText(text?: string | null): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

export interface DuplicateMatchResult {
  isDuplicate: boolean;
  matchType?: 'external_id' | 'phone' | 'website' | 'name_city_address';
  matchedLead?: Lead;
  reason?: string;
}

/**
 * Prioritized deduplication check against existing leads for the organization:
 * 1. Same source and same source_external_id, if available.
 * 2. Same normalized general phone number.
 * 3. Same normalized website hostname.
 * 4. Same normalized business name + city + address combination.
 * (Never duplicates based on business name alone.)
 */
export function checkDuplicateLead(
  candidate: Partial<Lead>,
  existingLeads: Lead[]
): DuplicateMatchResult {
  const candExtId = candidate.source_external_id?.trim();
  const candSource = candidate.source?.trim().toLowerCase();
  const candPhone = normalizePhoneNumber(candidate.phone || candidate.normalized_phone);
  const candHost = normalizeHostname(candidate.website_url);
  const candName = normalizeText(candidate.business_name);
  const candCity = normalizeText(candidate.city);
  const candAddress = normalizeText(candidate.address);

  for (const existing of existingLeads) {
    // Ignore archived leads if desired, or include them to prevent recreating
    // Rule 1: Same source and same source_external_id
    if (
      candExtId &&
      existing.source_external_id &&
      candSource &&
      existing.source &&
      candExtId === existing.source_external_id &&
      candSource === existing.source.toLowerCase()
    ) {
      return {
        isDuplicate: true,
        matchType: 'external_id',
        matchedLead: existing,
        reason: `Matched existing lead by external ID (${candExtId}) from ${existing.source}`,
      };
    }

    // Rule 2: Same normalized phone number (min 7 digits to avoid noise)
    if (candPhone && candPhone.length >= 7) {
      const exPhone = normalizePhoneNumber(existing.phone || existing.normalized_phone);
      if (exPhone && exPhone === candPhone) {
        return {
          isDuplicate: true,
          matchType: 'phone',
          matchedLead: existing,
          reason: `Matched existing lead by phone number (${existing.phone})`,
        };
      }
    }

    // Rule 3: Same normalized website hostname
    if (candHost && candHost.length > 3 && !['google.com', 'maps.google.com', 'instagram.com', 'facebook.com'].includes(candHost)) {
      const exHost = normalizeHostname(existing.website_url);
      if (exHost && exHost === candHost) {
        return {
          isDuplicate: true,
          matchType: 'website',
          matchedLead: existing,
          reason: `Matched existing lead by website domain (${exHost})`,
        };
      }
    }

    // Rule 4: Same normalized business name + city + address combination
    if (candName && candCity && candAddress) {
      const exName = normalizeText(existing.business_name);
      const exCity = normalizeText(existing.city);
      const exAddress = normalizeText(existing.address);
      if (exName === candName && exCity === candCity && exAddress === candAddress) {
        return {
          isDuplicate: true,
          matchType: 'name_city_address',
          matchedLead: existing,
          reason: `Matched existing lead by name, city, and street address`,
        };
      }
    }
  }

  return { isDuplicate: false };
}

/**
 * Merges a candidate lead into an existing lead by updating only empty/missing fields.
 * Never silently overwrites richer existing data.
 */
export function mergeEmptyFields(existing: Lead, candidate: Partial<Lead>): Lead {
  return {
    ...existing,
    address: existing.address || candidate.address || null,
    phone: existing.phone || candidate.phone || null,
    normalized_phone: existing.normalized_phone || candidate.normalized_phone || null,
    email: existing.email || candidate.email || null,
    website_url: existing.website_url || candidate.website_url || null,
    google_maps_url: existing.google_maps_url || candidate.google_maps_url || null,
    google_rating: existing.google_rating ?? candidate.google_rating ?? null,
    review_count: existing.review_count || candidate.review_count || 0,
    business_description: existing.business_description || candidate.business_description || null,
    logo_url: existing.logo_url || candidate.logo_url || null,
    opening_hours: existing.opening_hours && Object.keys(existing.opening_hours).length > 0
      ? existing.opening_hours
      : candidate.opening_hours || null,
    updated_at: new Date().toISOString(),
  };
}
