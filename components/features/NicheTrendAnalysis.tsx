import React, { useCallback, useState, useEffect } from 'react';
import type { NicheTrendResult } from '../../types';
import Loader from '../Loader';
import ErrorMessage from '../ErrorMessage';
import AnalysisCard from '../AnalysisCard';
import { VibeIcon, HiddenTrendIcon, LifecycleIcon } from '../Icons';
import PromptSuggestions from '../PromptSuggestions';
import { LifecycleGraph } from '../DataViz';

const NICHE_SUGGESTIONS = [
    "Kue Kering Lebaran",
    "Fashion Ramah Lingkungan",
    "Minuman Boba Sehat",
    "Perawatan Kulit Pria",
    "Sambal Kemasan Artisan",
    "Pakaian Modest Modern",
    "Jasa Titip (Jastip) Korea",
    "Hampers Pernikahan Unik",
    "Mainan Edukasi Anak Kayu",
    "Katering Diet Sehat Kantor",
    "Kursus Online Public Speaking"
];

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

    return (
        <div className="w-full animate-fade-in">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-800 mb-1">Analisis Tren Niche & Vibe Pasar</h2>
                <p className="text-slate-600 mb-4">Identifikasi peluang pasar dan gaya visual yang sedang tren dengan 1-2 kata kunci.</p>
                <form onSubmit={handleFormSubmit}>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder={`Contoh: ${placeholder}`}
                            className="flex-grow w-full px-4 py-3 text-slate-700 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder-gray-400 text-base"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !keywords.trim()}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
                        >
                            {isLoading ? 'Menganalisis...' : 'Analisis Sekarang'}
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
                {isLoading && <Loader messages={["Menganalisis tren pasar...", "Memindai Pinterest & TikTok...", "Mengidentifikasi estetika visual...", "Menyusun peluang..."]} />}
                {error && <ErrorMessage message={error} />}
                {result && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <AnalysisCard title="Vibe Board" icon={<VibeIcon />} className="lg:col-span-2">
                           <p className="font-semibold text-slate-800 text-xl tracking-tight">{result.dominantVibe.style}</p>
                           <p className="text-base">{result.dominantVibe.details}</p>
                           {vibeColors.length > 0 && (
                               <div className="mt-4">
                                   <p className="text-sm font-medium text-slate-500 mb-2">Palette Warna Kunci:</p>
                                   <div className="flex space-x-2">
                                       {vibeColors.map((color, i) => (
                                           <div key={i} className="w-10 h-10 rounded-full border border-slate-200" style={{ backgroundColor: color }} title={color}></div>
                                       ))}
                                   </div>
                               </div>
                           )}
                        </AnalysisCard>
                        <AnalysisCard title="Spotlight Opportunity" icon={<HiddenTrendIcon />}>
                           <p className="font-semibold text-slate-800 text-xl tracking-tight">{result.hiddenNiche.trend}</p>
                           <p className="text-base">{result.hiddenNiche.explanation}</p>
                        </AnalysisCard>
                        <AnalysisCard title="Proyeksi Kecepatan Tren" icon={<LifecycleIcon />}>
                            <LifecycleGraph activePhase={result.trendLifecycle.phase} />
                            <p className="mt-4 text-base">{result.trendLifecycle.recommendation}</p>
                        </AnalysisCard>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NicheTrendAnalysis;