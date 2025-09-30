import React, { useCallback, useState, useEffect } from 'react';
import type { CompetitorAnalysisResult, GroundingChunk } from '../../types';
import Loader from '../Loader';
import ErrorMessage from '../ErrorMessage';
import AnalysisCard from '../AnalysisCard';
import PromptSuggestions from '../PromptSuggestions';
import { CheckIcon, XIcon } from '../Icons';
import { SentimentChart } from '../DataViz';

const COMPETITOR_SUGGESTIONS = [
    "https://www.tokopedia.com/somethinc",
    "@kopikenangan.id",
    "https://shopee.co.id/eigeradventure",
    "https://shopee.co.id/skintific.id",
    "@bro.do",
    "@byurger.jkt",
    "@buttonscarves",
    "@esprecieloallure"
];

interface CompetitorAnalysisProps {
    identifier: string;
    setIdentifier: (identifier: string) => void;
    isLoading: boolean;
    error: string | null;
    result: CompetitorAnalysisResult | null;
    sources: GroundingChunk[];
    handleSubmit: () => Promise<void>;
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({
    identifier,
    setIdentifier,
    isLoading,
    error,
    result,
    sources,
    handleSubmit
}) => {
    const [placeholder, setPlaceholder] = useState('');

    useEffect(() => {
        setPlaceholder(COMPETITOR_SUGGESTIONS[Math.floor(Math.random() * COMPETITOR_SUGGESTIONS.length)]);
    }, []);
    
    const handleFormSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit();
    }, [handleSubmit]);

    const handleSelectSuggestion = useCallback((suggestion: string) => {
        setIdentifier(suggestion);
    }, [setIdentifier]);

    return (
        <div className="w-full animate-fade-in">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-800 mb-1">Riset Kompetitor & Pembedahan Produk</h2>
                <p className="text-slate-600 mb-4">Masukkan URL produk (Tokopedia/Shopee) atau nama toko (IG/TikTok) untuk dianalisis.</p>
                <form onSubmit={handleFormSubmit}>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder={`Contoh: ${placeholder}`}
                            className="flex-grow w-full px-4 py-3 text-slate-700 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder-gray-400 text-base"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !identifier.trim()}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
                        >
                            {isLoading ? 'Menganalisis...' : 'Analisis Kompetitor'}
                        </button>
                    </div>
                </form>
                {!identifier.trim() && !isLoading && !result && (
                    <PromptSuggestions 
                        suggestions={COMPETITOR_SUGGESTIONS} 
                        onSelectSuggestion={handleSelectSuggestion}
                    />
                )}
            </div>

            <div className="mt-8">
                {isLoading && <Loader messages={["Mengambil data kompetitor...", "Menganalisis ulasan pelanggan...", "Mengidentifikasi kekuatan & kelemahan...", "Merumuskan saran strategis..."]} />}
                {error && <ErrorMessage message={error} />}
                {result && (
                    <div className="animate-pop-in">
                        <AnalysisCard title="Pembedahan Deskripsi Produk" icon={"📝"}>
                            <div className="space-y-4">
                                <div>
                                   <h4 className="font-semibold text-slate-800">Kekuatan SEO</h4>
                                   <p>{result.productDescriptionAnalysis.seoStrength}</p>
                                </div>
                                <div className="border-t border-slate-200 pt-4">
                                   <h4 className="font-semibold text-slate-800">Daya Tarik Emosional</h4>
                                   <p>{result.productDescriptionAnalysis.emotionalAppeal}</p>
                                </div>
                            </div>
                        </AnalysisCard>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-3">
                                <AnalysisCard title="Sentimen Pelanggan (dari Ulasan)" icon={"💬"}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        <div>
                                            <h4 className="font-semibold text-green-700 mb-2">Pujian Paling Menonjol</h4>
                                            <ul className="space-y-2">
                                                {result.customerSentiment.topPraise.map((p, i) => (
                                                    <li key={i} className="flex items-start">
                                                        <CheckIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-500" />
                                                        <span className="text-slate-600">{p}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-red-700 mb-2">Masalah Paling Menonjol</h4>
                                            <ul className="space-y-2">
                                                {result.customerSentiment.topComplaints.map((c, i) => (
                                                    <li key={i} className="flex items-start">
                                                        <XIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-red-500" />
                                                        <span className="text-slate-600">{c}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </AnalysisCard>
                            </div>
                             <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col items-center justify-center h-full animate-pop-in" style={{ animationDelay: '100ms' }}>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4 tracking-tight text-center">Rangkuman Sentimen</h3>
                                    <SentimentChart 
                                        praiseCount={result.customerSentiment.topPraise.length} 
                                        complaintCount={result.customerSentiment.topComplaints.length}
                                    />
                                </div>
                            </div>
                        </div>

                        <AnalysisCard title="Your Winning Edge" icon={"🎯"}>
                           <p className="text-lg">{result.differentiationSuggestion}</p>
                        </AnalysisCard>
                        
                        {sources.length > 0 && (
                            <div className="mt-6 text-sm animate-pop-in" style={{ animationDelay: '200ms' }}>
                                <h4 className="font-semibold text-slate-700 mb-2">Sumber Informasi:</h4>
                                <ul className="space-y-1 list-disc list-inside text-slate-600">
                                    {sources.map((source, index) => (
                                        <li key={index}>
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-800 hover:underline">
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
        </div>
    );
};

export default CompetitorAnalysis;