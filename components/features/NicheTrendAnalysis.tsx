



import React, { useCallback, useState, useEffect } from 'react';
import type { NicheTrendResult } from '../../types';
import ErrorMessage from '../ErrorMessage';
import AnalysisCard from '../AnalysisCard';
import { PaletteIcon, HiddenTrendIcon, LifecycleIcon, SparkleIcon, BrainCircuitIcon, HashtagIcon, ContentFormatIcon } from '../Icons';
import PromptSuggestions from '../PromptSuggestions';
import { LifecycleGraph } from '../DataViz';

const NICHE_SUGGESTIONS = [
    "Thrift fashion style Y2K",
    "Self-photo studio",
    "Hampers Lebaran aesthetic",
    "Skincare lokal dengan retinal",
    "Kopi mocktail non-alkohol",
    "Jastip produk Thailand",
    "Workshop keramik",
    "Croissant cube viral",
    "Sepatu lari brand lokal",
    "Parfum aroma teh melati"
];

const SkeletonBar: React.FC<{ width?: string; height?: string; className?: string }> = ({ width = 'w-full', height = 'h-4', className = '' }) => (
    <div className={`${width} ${height} bg-slate-200 dark:bg-slate-700 rounded relative overflow-hidden shimmer ${className}`}></div>
);

const SkeletonCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
     <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 dark:bg-gray-800 dark:border-gray-700 ${className}`}>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);


const NicheSkeleton: React.FC = () => {
    return (
        <div className="animate-fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkeletonCard className="lg:col-span-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-hidden shimmer"></div>
                        <SkeletonBar width="w-1/3" />
                    </div>
                    <SkeletonBar width="w-2/3" height="h-6" />
                    <SkeletonBar />
                     <div className="flex space-x-2 pt-2">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 relative overflow-hidden shimmer"></div>
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 relative overflow-hidden shimmer"></div>
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 relative overflow-hidden shimmer"></div>
                    </div>
                </SkeletonCard>
                <SkeletonCard>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-hidden shimmer"></div>
                        <SkeletonBar width="w-1/2" />
                    </div>
                    <div className="space-y-3 mt-4">
                        <SkeletonBar width="w-3/4" height="h-6" />
                        <SkeletonBar />
                    </div>
                </SkeletonCard>
                 <SkeletonCard>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-hidden shimmer"></div>
                        <SkeletonBar width="w-1/2" />
                    </div>
                    <SkeletonBar />
                    <SkeletonBar width="w-5/6" />
                </SkeletonCard>
                 <SkeletonCard className="lg:col-span-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-hidden shimmer"></div>
                        <SkeletonBar width="w-1/3" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div>
                             <SkeletonBar width="w-1/2" height="h-5" className="mb-3" />
                             <div className="flex flex-wrap gap-2">
                                <SkeletonBar width="w-24" height="h-6" />
                                <SkeletonBar width="w-20" height="h-6" />
                                <SkeletonBar width="w-28" height="h-6" />
                             </div>
                        </div>
                        <div>
                             <SkeletonBar width="w-1/2" height="h-5" className="mb-3" />
                             <div className="space-y-3">
                                <SkeletonBar />
                                <SkeletonBar width="w-5/6" />
                             </div>
                        </div>
                    </div>
                </SkeletonCard>
             </div>
        </div>
    );
};

// A simple utility to extract potential hex colors from text
const extractColors = (text: string) => {
    const colorRegex = /(?:#|)((?:[0-9a-fA-F]{3}){1,2})\b/gi;
    const colorNames: { [key: string]: string } = {
        'merah': '#EF4444', 'hijau': '#22C55E', 'biru': '#3B82F6', 'kuning': '#EAB308',
        'sage green': '#8A9B6E', 'terracotta': '#E2725B', 'beige': '#F5F5DC'
    };
    let colors = (text.match(colorRegex) || []).slice(0, 4);
    Object.keys(colorNames).forEach(name => {
        if (text.toLowerCase().includes(name)) {
            colors.push(colorNames[name]);
        }
    });
    return [...new Set(colors)].slice(0, 4);
};

interface NicheTrendAnalysisProps {
    keywords: string;
    setKeywords: (keywords: string) => void;
    isLoading: boolean;
    error: string | null;
    result: NicheTrendResult | null;
    handleSubmit: () => Promise<void>;
}

const NicheTrendAnalysis: React.FC<NicheTrendAnalysisProps> = ({
    keywords,
    setKeywords,
    isLoading,
    error,
    result,
    handleSubmit
}) => {
    const [placeholder, setPlaceholder] = useState('');

    useEffect(() => {
        setPlaceholder(NICHE_SUGGESTIONS[Math.floor(Math.random() * NICHE_SUGGESTIONS.length)]);
    }, []);
    
    const handleFormSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit();
    }, [handleSubmit]);

    const handleSelectSuggestion = useCallback((suggestion: string) => {
        setKeywords(suggestion);
    }, [setKeywords]);

    const vibeColors = result ? extractColors(result.dominantVibe.details) : [];

    const confidenceColors: { [key: string]: string } = {
        'Tinggi': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
        'Sedang': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        'Rendah': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    };

    return (
        <div className="w-full">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg dark:bg-slate-800 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-1">Analisis Tren Niche & Vibe Pasar</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Identifikasi peluang pasar dan gaya visual yang sedang tren dengan 1-2 kata kunci.</p>
                <form onSubmit={handleFormSubmit}>
                    <div className="flex flex-col md:flex-row gap-2">
                        <input
                            type="text"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder={`Contoh: ${placeholder}`}
                            className="flex-grow w-full min-w-0 px-4 py-3 text-slate-700 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent placeholder-gray-400 text-base dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !keywords.trim()}
                            className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:bg-slate-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600 transition-all duration-300 transform hover:scale-105"
                        >
                            {isLoading ? 'Menganalisis...' : <><SparkleIcon className="w-5 h-5 mr-2" /> Analisis Sekarang</>}
                        </button>
                    </div>
                </form>
                {!keywords.trim() && !isLoading && !result && (
                    <PromptSuggestions 
                        suggestions={NICHE_SUGGESTIONS} 
                        onSelectSuggestion={handleSelectSuggestion} 
                    />
                )}
            </div>

            <div className="mt-8">
                {isLoading && <NicheSkeleton />}
                {error && <ErrorMessage message={error} />}
                {!isLoading && !error && result && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <AnalysisCard title="Vibe Board" icon={<PaletteIcon className="w-5 h-5" />} className="lg:col-span-2">
                           <p className="font-semibold text-slate-800 dark:text-slate-200 text-xl tracking-tight">{result.dominantVibe.style}</p>
                           <p className="text-base">{result.dominantVibe.details}</p>
                           {vibeColors.length > 0 && (
                               <div className="mt-4">
                                   <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Palette Warna Kunci:</p>
                                   <div className="flex space-x-2">
                                       {vibeColors.map((color, i) => (
                                           <div key={i} className="w-10 h-10 rounded-full border border-slate-200 dark:border-gray-600" style={{ backgroundColor: color }} title={color}></div>
                                       ))}
                                   </div>
                               </div>
                           )}
                        </AnalysisCard>
                        <AnalysisCard title="Spotlight Opportunity" icon={<HiddenTrendIcon className="w-5 h-5" />} animationDelay="100ms">
                           <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 text-xl tracking-tight">{result.hiddenNiche.trend}</p>
                                <p className="text-base mt-1">{result.hiddenNiche.explanation}</p>
                            </div>
                        </AnalysisCard>
                        <AnalysisCard title="Proyeksi Kecepatan Tren" icon={<LifecycleIcon className="w-5 h-5" />} animationDelay="200ms">
                            <LifecycleGraph activePhase={result.trendLifecycle.phase} />
                            <p className="mt-4 text-base">{result.trendLifecycle.recommendation}</p>
                             {result.trendLifecycle.confidence && result.trendLifecycle.confidenceReason && (
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BrainCircuitIcon className="w-5 h-5 text-brand dark:text-brand-light" />
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Keyakinan Analisis AI:</p>
                                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${confidenceColors[result.trendLifecycle.confidence] ?? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}`}>
                                            {result.trendLifecycle.confidence}
                                        </span>
                                    </div>
                                    <blockquote className="text-sm text-slate-500 dark:text-slate-400 border-l-4 border-brand-light dark:border-brand pl-4 italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-r-md">
                                        "{result.trendLifecycle.confidenceReason}"
                                    </blockquote>
                                </div>
                            )}
                        </AnalysisCard>

                         {result.socialMediaTrends && (
                            <AnalysisCard title="Social Media Pulse" icon={<SparkleIcon className="w-5 h-5" />} className="lg:col-span-2" animationDelay="300ms">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="flex items-center font-semibold text-slate-800 dark:text-slate-200 mb-3 text-base">
                                            <HashtagIcon className="w-5 h-5 mr-2 text-brand dark:text-brand-light" />
                                            Trending Hashtags
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.socialMediaTrends.trendingHashtags.map((tag, i) => (
                                                <span key={i} className="px-3 py-1 text-sm font-medium text-brand-text bg-brand/10 rounded-full dark:bg-brand/20 dark:text-brand-light">
                                                    #{tag.replace(/\s+/g, '').toLowerCase()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="flex items-center font-semibold text-slate-800 dark:text-slate-200 mb-3 text-base">
                                            <ContentFormatIcon className="w-5 h-5 mr-2 text-brand dark:text-brand-light" />
                                            Popular Content Formats
                                        </h4>
                                        <div className="space-y-3">
                                            {result.socialMediaTrends.popularContentFormats.map((format, i) => (
                                                <div key={i}>
                                                    <p className="font-semibold text-slate-700 dark:text-slate-300">{format.format}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{format.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </AnalysisCard>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NicheTrendAnalysis;