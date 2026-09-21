import {
  LeadDataProvider,
  LeadSearchParams,
  NormalizedLeadResult,
  SerperSearchResponse,
} from '../../src/lib/services/types.js';

export class SerperProvider implements LeadDataProvider {
  readonly providerName = 'Serper';

  private getCountryCode(country: string, explicitCode?: string): string {
    if (explicitCode && explicitCode.length === 2) {
      return explicitCode.toLowerCase();
    }
    const c = country.toLowerCase().trim();
    if (c.includes('emirates') || c.includes('uae') || c.includes('dubai') || c.includes('abu dhabi')) return 'ae';
    if (c.includes('saudi') || c.includes('ksa') || c.includes('riyadh') || c.includes('jeddah')) return 'sa';
    if (c.includes('qatar') || c.includes('doha')) return 'qa';
    if (c.includes('kuwait')) return 'kw';
    if (c.includes('bahrain') || c.includes('manama')) return 'bh';
    if (c.includes('oman') || c.includes('muscat')) return 'om';
    return '';
  }

  async searchLeads(params: LeadSearchParams): Promise<SerperSearchResponse> {
    const apiKey = process.env.SERPER_API_KEY?.trim();
    const query = `${params.category.trim()} in ${params.city.trim()}, ${params.country.trim()}`;

    if (!apiKey) {
      return {
        success: false,
        totalFound: 0,
        results: [],
        queryUsed: query,
        isConfigured: false,
        error: 'SERPER_API_KEY is not configured on the server. Please set SERPER_API_KEY in your environment variables to enable real business discovery.',
      };
    }

    const gl = this.getCountryCode(params.country, params.countryCode);
    const requestedNum = Math.min(Math.max(params.limit || 25, 10), 100);

    try {
      const payload: Record<string, unknown> = {
        q: query,
        num: requestedNum,
      };
      if (gl) {
        payload.gl = gl;
      }

      const response = await fetch('https://google.serper.dev/places', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            totalFound: 0,
            results: [],
            queryUsed: query,
            isConfigured: true,
            error: 'Invalid or unauthorized SERPER_API_KEY. Please verify your Serper account credentials.',
          };
        }
        if (response.status === 429) {
          return {
            success: false,
            totalFound: 0,
            results: [],
            queryUsed: query,
            isConfigured: true,
            error: 'Serper rate limit or credit quota exceeded. Please check your Serper dashboard.',
          };
        }
        return {
          success: false,
          totalFound: 0,
          results: [],
          queryUsed: query,
          isConfigured: true,
          error: `Serper provider error (${response.status}): ${errorText.slice(0, 150) || response.statusText}`,
        };
      }

      const data = await response.json();
      const rawPlaces: any[] = Array.isArray(data.places) ? data.places : [];

      const normalizedResults: NormalizedLeadResult[] = [];

      for (let i = 0; i < rawPlaces.length; i++) {
        const item = rawPlaces[i];
        const businessName = item.title || item.name;
        if (!businessName || typeof businessName !== 'string' || !businessName.trim()) {
          continue; // Skip malformed results without a business name
        }

        // Clean website URL
        let websiteUrl: string | null = null;
        if (item.website && typeof item.website === 'string' && item.website.trim().length > 0) {
          websiteUrl = item.website.trim();
        }

        // Google Maps URL (only if returned or derived from cid)
        let googleMapsUrl: string | null = null;
        if (item.mapsUrl && typeof item.mapsUrl === 'string') {
          googleMapsUrl = item.mapsUrl;
        } else if (item.googleUrl && typeof item.googleUrl === 'string') {
          googleMapsUrl = item.googleUrl;
        } else if (item.cid) {
          googleMapsUrl = `https://maps.google.com/?cid=${item.cid}`;
        }

        // Rating and review count
        const rating = typeof item.rating === 'number' && item.rating >= 0 && item.rating <= 5 ? item.rating : null;
        const reviewCount = typeof item.ratingCount === 'number' && item.ratingCount >= 0
          ? item.ratingCount
          : (typeof item.reviews === 'number' && item.reviews >= 0 ? item.reviews : 0);

        // Normalize phone number
        const rawPhone = item.phoneNumber || item.phone || null;
        const phone = rawPhone ? String(rawPhone).trim() : null;
        const normalizedPhone = phone ? phone.replace(/[^\d+]/g, '') : null;

        // Stable external identifier from Serper
        let sourceExternalId: string | undefined = undefined;
        if (item.cid) {
          sourceExternalId = String(item.cid);
        } else if (item.id) {
          sourceExternalId = String(item.id);
        } else if (item.position != null) {
          sourceExternalId = `serper_pos_${item.position}`;
        }

        normalizedResults.push({
          source_external_id: sourceExternalId,
          business_name: businessName.trim(),
          category_name: item.category || params.category.trim(),
          country: params.country.trim(),
          country_code: gl.toUpperCase() || 'AE',
          city: item.city || params.city.trim(),
          address: item.address ? String(item.address).trim() : null,
          phone,
          normalized_phone: normalizedPhone,
          email: item.email ? String(item.email).trim() : null,
          website_url: websiteUrl,
          google_maps_url: googleMapsUrl,
          google_rating: rating,
          review_count: reviewCount,
          opening_hours: item.openingHours || null,
          business_description: item.description || item.snippet || null,
          logo_url: item.thumbnail || item.imageUrl || null,
          source: 'serper',
          source_metadata: {
            cid: item.cid || null,
            position: item.position ?? i + 1,
            category: item.category || null,
            latitude: item.latitude ?? null,
            longitude: item.longitude ?? null,
            search_query: query,
            queried_at: new Date().toISOString(),
          },
        });
      }

      return {
        success: true,
        totalFound: normalizedResults.length,
        results: normalizedResults,
        queryUsed: query,
        isConfigured: true,
      };
    } catch (err: any) {
      return {
        success: false,
        totalFound: 0,
        results: [],
        queryUsed: query,
        isConfigured: true,
        error: `Failed to connect to Serper API: ${err?.message || 'Network error'}`,
      };
    }
  }
}
