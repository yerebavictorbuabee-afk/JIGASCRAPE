import {
  LeadDataProvider,
  LeadSearchParams,
  SerperSearchResponse,
  WebsiteAnalysisProvider,
  AuditResult,
  AIProvider,
  ConceptGenerationInput,
  GeneratedConcept,
  OutreachDraftInput,
  StorageProvider,
} from './types.ts';

/**
 * Client Serper Provider
 * Calls the secure backend endpoint /api/leads/search-serper which utilizes
 * the server-only SERPER_API_KEY environment variable.
 */
export class SerperProvider implements LeadDataProvider {
  readonly providerName = 'Serper';

  async searchLeads(params: LeadSearchParams): Promise<SerperSearchResponse> {
    try {
      const response = await fetch('/api/leads/search-serper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          totalFound: 0,
          results: [],
          queryUsed: `${params.category} in ${params.city}, ${params.country}`,
          isConfigured: errorData.isConfigured ?? true,
          error: errorData.error || `Server returned error (${response.status})`,
        };
      }

      const data: SerperSearchResponse = await response.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        totalFound: 0,
        results: [],
        queryUsed: `${params.category} in ${params.city}, ${params.country}`,
        isConfigured: false,
        error: `Could not connect to lead discovery service: ${err?.message || 'Network error'}`,
      };
    }
  }
}

export class PlaceholderWebsiteAnalysisProvider implements WebsiteAnalysisProvider {
  readonly providerName = 'WebsiteAnalysisProvider (Phase 2 & 3 Heuristics)';

  async auditWebsite(url: string | null): Promise<AuditResult> {
    console.info('[Phase 2 Placeholder] auditWebsite called with:', url);
    return {
      hasWebsite: !!url,
      isMobileResponsive: false,
      hasWhatsAppButton: false,
      hasModernDesign: false,
      strengths: [],
      digitalGaps: ['No mobile booking flow', 'Slow server response'],
      opportunitySummary: 'Digital opportunity audit pending analysis engine activation.',
      score: 0,
    };
  }
}

export class PlaceholderAIProvider implements AIProvider {
  readonly providerName = 'AIProvider (Phase 3 & 4 Gemini Engine)';

  async generateWebsiteConcept(input: ConceptGenerationInput): Promise<GeneratedConcept> {
    console.info('[Phase 3 Placeholder] generateWebsiteConcept called for:', input.businessName);
    return {
      headline: input.businessName,
      subheadline: `High-conversion digital presence for ${input.city}`,
      recommendedColorPalette: ['#18181B', '#DC2626', '#F4F4F5'],
      heroCallToAction: 'Contact Us',
      keyServices: [],
      whatsappPitchAngle: 'Direct value proposition demo link',
    };
  }

  async draftOutreachMessage(input: OutreachDraftInput): Promise<string> {
    console.info('[Phase 4 Placeholder] draftOutreachMessage for:', input.businessName);
    return `Hi team at ${input.businessName}! Prepared a modern digital concept preview for your team: ${input.conceptUrl}`;
  }

  async generateFollowUpMessage(): Promise<string> {
    return 'Following up on the concept link shared previously.';
  }
}

export class PlaceholderStorageProvider implements StorageProvider {
  readonly providerName = 'StorageProvider (Supabase Storage / S3)';

  async uploadAsset(path: string): Promise<string> {
    return `https://storage.jigaway.internal/${path}`;
  }

  getPublicUrl(path: string): string {
    return `https://storage.jigaway.internal/${path}`;
  }

  async deleteAsset(): Promise<void> {}
}

