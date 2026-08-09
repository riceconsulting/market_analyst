


import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import type { CompetitorAnalysisResult, GroundingChunk, HistoryItem } from '../../types';
import { useHistory } from '../../hooks/useHistory';
import ErrorMessage from '../ErrorMessage';
import AnalysisCard from '../AnalysisCard';
import PromptSuggestions from '../PromptSuggestions';
import { 
    SparkleIcon, 
    HashtagIcon, 
    PriceTagIcon, 
    XIcon, 
    StarIcon, 
    TrendingUpIcon, 
    HistoryIcon,
    ShieldCheckIcon,
    WeaknessIcon,
    OpportunityIcon,
    ThreatIcon,
    ScaleIcon,
    PaletteIcon,
    DocumentTextIcon,
    ChatBubbleLeftRightIcon,
    BullseyeIcon
} from '../Icons';
import { SentimentChart, SentimentBarChart, TrendChart, PricingBenchmarkChart } from '../DataViz';

const COMPETITOR_SUGGESTIONS = [
    { display: "SASC Official (fokus: kolaborasi influencer)", identifier: "https://www.tokopedia.com/sasc", focus: "kolaborasi dengan influencer" },
    { display: "@skintific.id (fokus: strategi harga & promo)", identifier: "https://shopee.co.id/skintific.id", focus: "strategi harga dan promo bundling" },
    { display: "Maternal Disaster (fokus: branding & desain)", identifier: "https://shopee.co.id/maternal_disaster", focus: "branding dan desain merchandise" },
    { display: "Rosé All Day (fokus: kemasan & unboxing)", identifier: "https://www.tokopedia.com/roseallday", focus: "kemasan produk dan unboxing experience" },
    { display: "@sejiwacoffee (fokus: nilai produk premium)", identifier: "@sejiwacoffee", focus: "proposisi nilai produk premium" },
    { display: "@msglowbeauty (fokus: reseller & testimoni)", identifier: "@msglowbeauty", focus: "jaringan reseller dan testimoni pelanggan" },
    { display: "@gildak.id (fokus: menu viral Korea)", identifier: "@gildak.id", focus: "menu viral dan adaptasi tren Korea" }
];

const SkeletonBar: React.FC<{ width?: string; height?: string; className?: string }> = ({ width = 'w-full', height = 'h-4', className = '' }) => (
    <div className={`${width} ${height} bg-surface-light dark:bg-surface-dark dark:bg-surface-light dark:bg-surface-dark rounded relative overflow-hidden shimmer ${className}`}></div>
);

const SkeletonCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
     <div className={`bg-white rounded-xl border border-border-light dark:border-border-dark shadow-sm p-5 sm:p-6 dark:bg-surface-light dark:bg-surface-dark dark:border-border-light dark:border-border-dark ${className}`}>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const CompetitorSkeleton: React.FC = () => {
    return (
        <div className="animate-fade-in space-y-6">
             <SkeletonCard>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-surface-light dark:bg-surface-dark dark:bg-surface-light dark:bg-surface-dark rounded-md relative overflow-hidden shimmer"></div>
                    <SkeletonBar width="w-1/3" />
                </div>
                 <div className="h-24"> 
                    <SkeletonBar width="w-1/2" height="h-5" className="mb-3" />
                    <SkeletonBar width="w-full" height="h-16" />
                 </div>
            </SkeletonCard>
            <SkeletonCard>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-surface-light dark:bg-surface-dark dark:bg-surface-light dark:bg-surface-dark rounded-md relative overflow-hidden shimmer"></div>
                    <SkeletonBar width="w-1/3" />
                </div>
                <SkeletonBar width="w-1/4" height="h-5" />
                <SkeletonBar />
                <SkeletonBar width="w-5/6" />
                <div className="pt-4 mt-4 border-t border-border-light dark:border-border-dark dark:border-border-light dark:border-border-dark">
                    <SkeletonBar width="w-1/4" height="h-5" />
                    <SkeletonBar />
                    <SkeletonBar width="w-5/6" />
                </div>
            </SkeletonCard>
            <SkeletonCard>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-surface-light dark:bg-surface-dark dark:bg-surface-light dark:bg-surface-dark rounded-md relative overflow-hidden shimmer"></div>
                    <SkeletonBar width="w-1/3" />
                </div>
                <SkeletonBar width="w-3/4" height="h-6" className="mb-4" />
                <div className="flex flex-wrap gap-2 pb-4 mb-4 border-b border-border-light dark:border-border-dark dark:border-border-light dark:border-border-dark">
                    <div className="w-20 h-8 rounded-full bg-surface-light dark:bg-surface-dark dark:bg-surface-light dark:bg-surface-dark relative overflow-hidden shimmer"></div>
                    <div className="w-20 h-8 rounded-full bg-surface-light dark:bg-surface-dark dark:bg-surface-light dark:bg-surface-dark relative overflow-hidden shimmer"></div>
                    <div className="w-20 h-8 rounded-full bg-surface-light dark:bg-surface-dark dark:bg-surface-light dark:bg-surface-dark relative overflow-hidden shimmer"></div>
                </div>
                <SkeletonBar />
                <SkeletonBar width="w-5/6" />
            </SkeletonCard>
            <SkeletonCard>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-surface-light dark:bg-surface-dark dark:bg-surface-light dark:bg-surface-dark rounded-md relative overflow-hidden shimmer"></div>
                    <SkeletonBar width="w-1/3" />
                </div>
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border-light dark:border-border-dark dark:border-border-light dark:border-border-dark">
                    <div className="w-6 h-6 rounded-full bg-surface-light dark:bg-surface-dark dark:bg-surface-light dark:bg-surface-dark relative overflow-hidden shimmer"></div>
                    <SkeletonBar width="w-1/2" height="h-6" />
                </div>
                <div className="space-y-3">
                    <SkeletonBar width="w-1/4" height="h-5" />
                    <SkeletonBar />
                </div>
            </SkeletonCard>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <SkeletonCard className="lg:col-span-3">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-surface-light dark:bg-surface-dark dark:bg-surface-light dark:bg-surface-dark rounded-md relative overflow-hidden shimmer"></div>
                        <SkeletonBar width="w-1/2" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <SkeletonBar width="w-3/4" height="h-5" />
                            <div className="space-y-3 mt-2">
                                <SkeletonBar />
                                <SkeletonBar />
                                <SkeletonBar />
                            </div>
                        </div>
                         <div>
                            <SkeletonBar width="w-3/4" height="h-5" />
                            <div className="space-y-3 mt-2">
                                <SkeletonBar />
                                <SkeletonBar />
                                <SkeletonBar />
                            </div>
                        </div>
                    </div>
                </SkeletonCard>
                <SkeletonCard className="lg:col-span-2">
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-28 h-28 rounded-full bg-surface-light dark:bg-surface-dark dark:bg-surface-light dark:bg-surface-dark relative overflow-hidden shimmer"></div>
                        <SkeletonBar width="w-3/4" height="h-5" className="mt-4" />
                    </div>
                </SkeletonCard>
            </div>
             <SkeletonCard>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-surface-light dark:bg-surface-dark dark:bg-surface-light dark:bg-surface-dark rounded-md relative overflow-hidden shimmer"></div>
                    <SkeletonBar width="w-1/3" />
                </div>
                <SkeletonBar height="h-6" />
                <SkeletonBar width="w-5/6" height="h-6" />
            </SkeletonCard>
        </div>
    );
};

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => modalRef.current?.focus(), 50); // Focus after transition
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      style={{ animationDuration: '0.2s' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md m-4 bg-white rounded-xl shadow-xl animate-pop-in dark:bg-surface-light dark:bg-surface-dark"
        style={{ animationDuration: '0.3s' }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-border-light dark:border-border-dark">
          <h3 id="modal-title" className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark dark:text-white">
            {title}
          </h3>
          <button
            type="button"
            className="text-text-primary-light dark:text-text-primary-dark bg-transparent hover:bg-surface-light dark:bg-surface-dark hover:text-text-primary-light dark:text-text-primary-dark rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-surface-light dark:bg-surface-dark dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-brand"
            onClick={onClose}
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-base leading-relaxed text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
};


const parseStarRating = (ratingStr: string): number | null => {
    if (!ratingStr || typeof ratingStr !== 'string') return null;
    const match = ratingStr.match(/^[0-9.]+/);
    if (match) {
        return parseFloat(match[0]);
    }
    return null;
};

interface CompetitorAnalysisProps {
    identifier: string;
    setIdentifier: (identifier: string) => void;
    focusKeywords: string;
    setFocusKeywords: (keywords: string) => void;
    isLoading: boolean;
    error: string | null;
    result: CompetitorAnalysisResult | null;
    sources: GroundingChunk[];
    handleSubmit: () => Promise<void>;
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({
    identifier,
    setIdentifier,
    focusKeywords,
    setFocusKeywords,
    isLoading,
    error,
    result,
    sources,
    handleSubmit
}) => {
    const [placeholder, setPlaceholder] = useState('');
    const [modalContent, setModalContent] = useState<{title: string, text: string} | null>(null);
    const { history } = useHistory();

    const competitorHistory = useMemo(() => {
        if (!identifier || !result) return [];
        
        // Find all history items for the same competitor
        const relevantHistory = history.filter(
            (item): item is HistoryItem & { result: CompetitorAnalysisResult } =>
                item.type === 'competitor' && item.query.trim().toLowerCase() === identifier.trim().toLowerCase()
        );

        // De-duplicate in case of multiple analyses at the exact same timestamp (unlikely but safe)
        const uniqueHistory = Array.from(new Map(relevantHistory.map(item => [item.timestamp, item])).values());
        
        // FIX: Explicitly type sort function parameters to fix TypeScript inference error
        return uniqueHistory.sort((a: HistoryItem, b: HistoryItem) => a.timestamp - b.timestamp);
    }, [identifier, result, history]);

    const sentimentTrendData = useMemo(() => {
        return competitorHistory
            .map(item => {
                const sentiment = item.result.customerSentiment;
                if (!sentiment) return null;
                const praiseCount = sentiment.topPraise?.length || 0;
                const complaintCount = sentiment.topComplaints?.length || 0;
                const total = praiseCount + complaintCount;
                if (total === 0) return null;
                return {
                    timestamp: item.timestamp,
                    value: (praiseCount / total) * 100
                };
            })
            .filter((item): item is { timestamp: number; value: number } => item !== null);
    }, [competitorHistory]);

     const ratingTrendData = useMemo(() => {
        return competitorHistory
            .map(item => {
                const rating = parseStarRating(item.result.socialProof?.starRating);
                if (rating === null) return null;
                return {
                    timestamp: item.timestamp,
                    value: rating
                };
            })
            .filter((item): item is { timestamp: number; value: number } => item !== null);
    }, [competitorHistory]);

    useEffect(() => {
        setPlaceholder(COMPETITOR_SUGGESTIONS[Math.floor(Math.random() * COMPETITOR_SUGGESTIONS.length)].identifier);
    }, []);
    
    const handleFormSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit();
    }, [handleSubmit]);

    const handleSelectSuggestion = useCallback((suggestionDisplay: string) => {
        const selected = COMPETITOR_SUGGESTIONS.find(s => s.display === suggestionDisplay);
        if (selected) {
            setIdentifier(selected.identifier);
            setFocusKeywords(selected.focus);
        }
    }, [setIdentifier, setFocusKeywords]);

    const handleSentimentItemClick = (text: string, type: 'praise' | 'complaint') => {
        setModalContent({
            title: type === 'praise' ? 'Detail Pujian Pelanggan' : 'Detail Keluhan Pelanggan',
            text: text
        });
    };

    const closeModal = () => {
        setModalContent(null);
    };

    return (
        <div className="w-full">
            <div className="bg-white p-6 rounded-xl border border-border-light dark:border-border-dark shadow-lg dark:bg-surface-light dark:bg-surface-dark dark:border-border-light dark:border-border-dark">
                <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark mb-1">Riset Kompetitor & Pembedahan Produk</h2>
                <p className="text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark mb-4">Masukkan URL atau nama toko kompetitor. Anda juga bisa menambahkan kata kunci untuk memfokuskan analisis.</p>
                <form onSubmit={handleFormSubmit}>
                    <div className="flex flex-col gap-3">
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder={`Contoh: ${placeholder}`}
                            className="w-full px-4 py-3 text-text-primary-light dark:text-text-primary-dark bg-white border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent placeholder-gray-400 text-base dark:bg-surface-light dark:bg-surface-dark dark:border-border-light dark:border-border-dark dark:text-text-primary-light dark:text-text-primary-dark dark:placeholder-slate-500"
                            disabled={isLoading}
                        />
                        <input
                            type="text"
                            value={focusKeywords}
                            onChange={(e) => setFocusKeywords(e.target.value)}
                            placeholder="Fokus analisis (opsional), mis: 'keberlanjutan', 'layanan pelanggan'"
                            className="w-full px-4 py-3 text-text-primary-light dark:text-text-primary-dark bg-white border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent placeholder-gray-400 text-base dark:bg-surface-light dark:bg-surface-dark dark:border-border-light dark:border-border-dark dark:text-text-primary-light dark:text-text-primary-dark dark:placeholder-slate-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !identifier.trim()}
                            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:bg-surface-light dark:bg-surface-dark disabled:cursor-not-allowed dark:disabled:bg-surface-light dark:bg-surface-dark transition-all duration-300 transform hover:scale-105"
                        >
                            {isLoading ? 'Menganalisis...' : <><SparkleIcon className="w-5 h-5 mr-2" /> Analisis Kompetitor</>}
                        </button>
                    </div>
                </form>
                {!identifier.trim() && !isLoading && !result && (
                    <PromptSuggestions 
                        suggestions={COMPETITOR_SUGGESTIONS.map(s => s.display)} 
                        onSelectSuggestion={handleSelectSuggestion}
                    />
                )}
            </div>

            <div className="mt-8">
                {isLoading && <CompetitorSkeleton />}
                {error && <ErrorMessage message={error} />}
                {!isLoading && !error && result && (
                    <div className="space-y-6">
                        
                        {competitorHistory.length > 1 ? (
                            <AnalysisCard title="Performance Trends Over Time" icon={<TrendingUpIcon className="w-5 h-5"/>}>
                                <div className="space-y-6">
                                    {sentimentTrendData.length > 1 && (
                                        <TrendChart
                                            data={sentimentTrendData}
                                            label="Customer Sentiment (% Positive)"
                                            color="var(--color-primary-light)"
                                            formatValue={(v) => `${v.toFixed(1)}%`}
                                        />
                                    )}
                                    {ratingTrendData.length > 1 && (
                                         <TrendChart
                                            data={ratingTrendData}
                                            label="Star Rating"
                                            color="var(--color-accent-light)"
                                            formatValue={(v) => `${v.toFixed(2)} ★`}
                                        />
                                    )}
                                </div>
                            </AnalysisCard>
                        ) : (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-brand/10 border border-brand/20 text-brand-text dark:bg-brand/20 dark:border-brand/40 dark:text-brand-light animate-slide-fade-in">
                                <HistoryIcon className="w-6 h-6 flex-shrink-0" />
                                <p className="text-sm">
                                    Ini adalah analisis pertama Anda untuk kompetitor ini. Analisis lagi di masa depan untuk melihat tren performa mereka dari waktu ke waktu.
                                </p>
                            </div>
                        )}

                        <AnalysisCard title="Pembedahan Deskripsi Produk" icon={<DocumentTextIcon className="w-5 h-5"/>} animationDelay="100ms">
                            <div className="space-y-4">
                                <div>
                                   <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">Kekuatan SEO</h4>
                                   <p>{result.productDescriptionAnalysis.seoStrength}</p>
                                </div>
                                <div className="border-t border-border-light dark:border-border-dark dark:border-border-light dark:border-border-dark pt-4">
                                   <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">Daya Tarik Emosional</h4>
                                   <p>{result.productDescriptionAnalysis.emotionalAppeal}</p>
                                </div>
                            </div>
                        </AnalysisCard>
                        
                        {result.pricingStrategy && (
                            <AnalysisCard title="Analisis Strategi Harga" icon={<PriceTagIcon className="w-5 h-5"/>} animationDelay="200ms">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">Posisi Harga</h4>
                                        <p>{result.pricingStrategy.pricePointAnalysis}</p>
                                    </div>
                                    <div className="border-t border-border-light dark:border-border-dark dark:border-border-light dark:border-border-dark pt-4">
                                        <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">Proposisi Nilai</h4>
                                        <p>{result.pricingStrategy.valueProposition}</p>
                                    </div>
                                </div>
                            </AnalysisCard>
                        )}
                        
                        {result.visualBrandingAnalysis && (
                            <AnalysisCard title="Analisis Visual Branding" icon={<PaletteIcon className="w-5 h-5"/>} animationDelay="300ms">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">Identitas Brand</h4>
                                        <p className="text-xl font-semibold tracking-tight">{result.visualBrandingAnalysis.brandIdentity}</p>
                                    </div>
                                    {result.visualBrandingAnalysis.colorPalette && result.visualBrandingAnalysis.colorPalette.length > 0 && (
                                        <div className="border-t border-border-light dark:border-border-dark dark:border-border-light dark:border-border-dark pt-4">
                                            <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark mb-2">Palet Warna Kunci</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.visualBrandingAnalysis.colorPalette.map((color, i) => (
                                                    <div key={i} className="flex items-center gap-2 p-1 pr-3 bg-surface-light dark:bg-surface-dark dark:bg-surface-light dark:bg-surface-dark rounded-full">
                                                        <div className="w-6 h-6 rounded-full border border-border-light dark:border-border-dark dark:border-border-light dark:border-border-dark" style={{ backgroundColor: color }} title={color}></div>
                                                        <span className="text-xs font-mono text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">{color}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="border-t border-border-light dark:border-border-dark dark:border-border-light dark:border-border-dark pt-4">
                                        <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">Kesesuaian Visual dengan Target Pasar</h4>
                                        <p>{result.visualBrandingAnalysis.visualAlignment}</p>
                                    </div>
                                </div>
                            </AnalysisCard>
                        )}

                        {result.pricingBenchmark && result.pricingBenchmark.length > 0 && (
                            <AnalysisCard title="Benchmarking Harga Kompetitor" icon={<ScaleIcon className="w-5 h-5"/>} animationDelay="400ms">
                                <PricingBenchmarkChart
                                    mainCompetitor={{ name: identifier, priceRange: result.pricingStrategy.priceRange }}
                                    benchmarkData={result.pricingBenchmark}
                                />
                                <div className="mt-6 space-y-4">
                                    {result.pricingBenchmark.map((competitor, i) => (
                                        <div key={i} className="border-t border-border-light dark:border-border-dark dark:border-border-light dark:border-border-dark pt-4">
                                            <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">{competitor.name}</h4>
                                            <p className="text-sm text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark mb-1">{competitor.pricePointAnalysis}</p>
                                            <p>{competitor.valueProposition}</p>
                                        </div>
                                    ))}
                                </div>
                            </AnalysisCard>
                        )}

                        {result.socialProof && (result.socialProof.starRating || result.socialProof.testimonials?.length > 0) && (
                            <AnalysisCard title="Bukti Sosial (Social Proof)" icon={<StarIcon className="w-5 h-5 text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark" />} animationDelay="500ms">
                                {result.socialProof.starRating && (
                                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border-light dark:border-border-dark dark:border-border-light dark:border-border-dark">
                                        <StarIcon className="w-6 h-6 text-amber-400" />
                                        <p className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">{result.socialProof.starRating}</p>
                                    </div>
                                )}
                                {result.socialProof.testimonials?.length > 0 && (
                                     <div className="space-y-4">
                                        <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">Testimoni Kunci</h4>
                                        {result.socialProof.testimonials.map((testimonial, i) => (
                                            <blockquote key={i} className="border-l-4 border-brand-light pl-4 italic text-text-primary-light dark:text-text-primary-dark dark:border-brand dark:text-text-primary-light dark:text-text-primary-dark">
                                                "{testimonial}"
                                            </blockquote>
                                        ))}
                                     </div>
                                )}
                                {result.socialProof.userGeneratedContentExamples && (
                                     <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark dark:border-border-light dark:border-border-dark">
                                        <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">Contoh Konten Buatan Pengguna (UGC)</h4>
                                         <ul className="list-disc list-inside mt-2 space-y-1 text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">
                                            {Array.isArray(result.socialProof.userGeneratedContentExamples)
                                                ? result.socialProof.userGeneratedContentExamples.map((ugc, i) => (
                                                    <li key={i}>{ugc}</li>
                                                  ))
                                                : <li>{result.socialProof.userGeneratedContentExamples}</li>
                                            }
                                        </ul>
                                     </div>
                                )}
                            </AnalysisCard>
                        )}


                        {result.relevantKeywords && result.relevantKeywords.length > 0 && (
                            <AnalysisCard title="Kata Kunci Terkait" icon={<HashtagIcon className="w-5 h-5"/>} animationDelay="600ms">
                                <div className="flex flex-wrap gap-2">
                                    {result.relevantKeywords.map((keyword, i) => (
                                        <span key={i} className="px-3 py-1 text-sm font-medium text-brand-text bg-brand/10 rounded-full dark:bg-brand/20 dark:text-brand-light">
                                            #{keyword.replace(/\s+/g, '').toLowerCase()}
                                        </span>
                                    ))}
                                </div>
                            </AnalysisCard>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-3">
                                <AnalysisCard title="Sentimen Pelanggan (dari Ulasan)" icon={<ChatBubbleLeftRightIcon className="w-5 h-5"/>} animationDelay="700ms">
                                    <SentimentBarChart 
                                        praise={result.customerSentiment.topPraise} 
                                        complaints={result.customerSentiment.topComplaints} 
                                        onItemClick={handleSentimentItemClick}
                                    />
                                </AnalysisCard>
                            </div>
                             <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl border border-border-light dark:border-border-dark/80 shadow-lg p-5 sm:p-6 flex flex-col items-center justify-center h-full animate-slide-fade-in dark:bg-surface-light dark:bg-surface-dark dark:border-border-light dark:border-border-dark/80" style={{ animationDelay: '800ms' }}>
                                    <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight text-center">Rangkuman Sentimen</h3>
                                    <SentimentChart 
                                        praiseCount={result.customerSentiment.topPraise.length} 
                                        complaintCount={result.customerSentiment.topComplaints.length}
                                    />
                                </div>
                            </div>
                        </div>

                        {result.swotAnalysis && (
                            <AnalysisCard title="Analisis SWOT" icon={<SparkleIcon className="w-5 h-5"/>} animationDelay="900ms">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Strengths */}
                                    <div className="bg-surface-light dark:bg-surface-dark dark:bg-surface-light dark:bg-surface-dark/50 p-4 rounded-lg border border-border-light dark:border-border-dark dark:border-border-light dark:border-border-dark">
                                        <h4 className="flex items-center font-semibold text-base text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark mb-3">
                                            <ShieldCheckIcon className="w-5 h-5 mr-2 text-success-light dark:text-success-dark" />
                                            Kekuatan (Strengths)
                                        </h4>
                                        <ul className="space-y-2 text-sm text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">
                                            {result.swotAnalysis.strengths.map((item, i) => (
                                                <li key={`s-${i}`} className="flex items-start">
                                                    <svg className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-success-light dark:text-success-dark" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    {/* Weaknesses */}
                                    <div className="bg-surface-light dark:bg-surface-dark dark:bg-surface-light dark:bg-surface-dark/50 p-4 rounded-lg border border-border-light dark:border-border-dark dark:border-border-light dark:border-border-dark">
                                        <h4 className="flex items-center font-semibold text-base text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark mb-3">
                                            <WeaknessIcon className="w-5 h-5 mr-2 text-error-light dark:text-error-dark" />
                                            Kelemahan (Weaknesses)
                                        </h4>
                                        <ul className="space-y-2 text-sm text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">
                                            {result.swotAnalysis.weaknesses.map((item, i) => (
                                                <li key={`w-${i}`} className="flex items-start">
                                                    <svg className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-error-light dark:text-error-dark" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    {/* Opportunities */}
                                    <div className="bg-surface-light dark:bg-surface-dark dark:bg-surface-light dark:bg-surface-dark/50 p-4 rounded-lg border border-border-light dark:border-border-dark dark:border-border-light dark:border-border-dark">
                                        <h4 className="flex items-center font-semibold text-base text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark mb-3">
                                            <OpportunityIcon className="w-5 h-5 mr-2 text-brand" />
                                            Peluang (Opportunities)
                                        </h4>
                                        <ul className="space-y-2 text-sm text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">
                                            {result.swotAnalysis.opportunities.map((item, i) => (
                                                <li key={`o-${i}`} className="flex items-start">
                                                    <svg className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-brand" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path></svg>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    {/* Threats */}
                                    <div className="bg-surface-light dark:bg-surface-dark dark:bg-surface-light dark:bg-surface-dark/50 p-4 rounded-lg border border-border-light dark:border-border-dark dark:border-border-light dark:border-border-dark">
                                        <h4 className="flex items-center font-semibold text-base text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark mb-3">
                                            <ThreatIcon className="w-5 h-5 mr-2 text-amber-500" />
                                            Ancaman (Threats)
                                        </h4>
                                        <ul className="space-y-2 text-sm text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">
                                            {result.swotAnalysis.threats.map((item, i) => (
                                                <li key={`t-${i}`} className="flex items-start">
                                                    <svg className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </AnalysisCard>
                        )}

                        <AnalysisCard title="Your Winning Edge" icon={<BullseyeIcon className="w-5 h-5"/>} animationDelay="1000ms">
                           <p className="text-lg">{result.differentiationSuggestion}</p>
                        </AnalysisCard>
                        
                        {sources.length > 0 && (
                            <div className="mt-6 text-sm animate-slide-fade-in" style={{ animationDelay: '1100ms' }}>
                                <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark mb-2">Sumber Informasi:</h4>
                                <ul className="space-y-1 list-disc list-inside text-text-primary-light dark:text-text-primary-dark dark:text-text-primary-light dark:text-text-primary-dark">
                                    {sources.map((source, index) => (
                                        <li key={index}>
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-brand hover:text-brand-dark dark:text-brand-light dark:hover:text-brand">
                                                {source.web.title || source.web.uri}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Modal
                isOpen={!!modalContent}
                onClose={closeModal}
                title={modalContent?.title || ''}
            >
                {modalContent?.text}
            </Modal>
        </div>
    );
};

export default CompetitorAnalysis;