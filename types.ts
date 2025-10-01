export interface NicheTrendResult {
  dominantVibe: {
    style: string;
    details: string;
  };
  hiddenNiche: {
    trend: string;
    explanation: string;
    iconUrl?: string;
  };
  trendLifecycle: {
    phase: 'Baru' | 'Berkembang' | 'Matang' | 'Menurun';
    recommendation: string;
    confidence: 'Tinggi' | 'Sedang' | 'Rendah';
    confidenceReason: string;
  };
  socialMediaTrends: {
    trendingHashtags: string[];
    popularContentFormats: {
      format: string;
      description: string;
    }[];
  };
}

export interface CompetitorAnalysisResult {
    productDescriptionAnalysis: {
        seoStrength: string;
        emotionalAppeal: string;
    };
    pricingStrategy: {
        pricePointAnalysis: string;
        valueProposition: string;
        priceRange?: [number, number] | null;
    };
    customerSentiment: {
        topPraise: string[];
        topComplaints: string[];
    };
    socialProof: {
        testimonials: string[];
        starRating: string; // e.g., "4.8/5 (1,234 ulasan)"
        userGeneratedContentExamples: string[];
    };
    swotAnalysis: {
        strengths: string[];
        weaknesses: string[];
        opportunities: string[];
        threats: string[];
    };
    visualBrandingAnalysis: {
        brandIdentity: string;
        colorPalette: string[];
        visualAlignment: string;
    };
    pricingBenchmark?: {
        name: string;
        pricePointAnalysis: string;
        valueProposition: string;
        priceRange?: [number, number] | null;
    }[];
    relevantKeywords: string[];
    differentiationSuggestion: string;
}

export interface Competitor {
  name: string;
  type: string;
  reason: string;
  iconUrl?: string;
}

export interface CompetitorDiscoveryResult {
  directCompetitors: Competitor[];
  indirectCompetitors: Competitor[];
}


export interface GroundingChunk {
    web: {
        uri: string;
        title: string;
    };
}

export interface SalesCopyResult {
  marketReactionAnalysis: string;
  riskMitigationCopy: {
    title: string;
    body: string;
  };
}

export interface HistoryItem {
  id: string;
  type: 'niche' | 'competitor' | 'copy' | 'discovery';
  query: string;
  focusKeywords?: string;
  timestamp: number;
  result: NicheTrendResult | CompetitorAnalysisResult | SalesCopyResult | CompetitorDiscoveryResult;
  sources?: GroundingChunk[];
}