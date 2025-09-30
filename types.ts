

export interface NicheTrendResult {
  dominantVibe: {
    style: string;
    details: string;
  };
  hiddenNiche: {
    trend: string;
    explanation: string;
  };
  trendLifecycle: {
    phase: 'Baru' | 'Berkembang' | 'Matang' | 'Menurun';
    recommendation: string;
  };
}

export interface CompetitorAnalysisResult {
    productDescriptionAnalysis: {
        seoStrength: string;
        emotionalAppeal: string;
    };
    customerSentiment: {
        topPraise: string[];
        topComplaints: string[];
    };
    differentiationSuggestion: string;
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
  type: 'niche' | 'competitor' | 'copy';
  query: string;
  timestamp: number;
  result: NicheTrendResult | CompetitorAnalysisResult | SalesCopyResult;
  sources?: GroundingChunk[];
}
