

import React, { useCallback, useState, useEffect } from 'react';
import type { CompetitorDiscoveryResult, GroundingChunk, Competitor } from '../../types';
import Loader from '../Loader';
import ErrorMessage from '../ErrorMessage';
import AnalysisCard from '../AnalysisCard';
import PromptSuggestions from '../PromptSuggestions';
import { SparkleIcon, SwordIcon, HandshakeIcon } from '../Icons';

const DISCOVERY_SUGGESTIONS = [
    "Brand modest fashion B2C",
    "Coffee shop dengan live music",
    "Agensi social media marketing",
    "Catering plant-based",
    "Toko online sneakers original",
    "Aplikasi investasi reksadana",
    "Gelato artisan rasa lokal",
    "Jasa event organizer pernikahan"
];

interface CompetitorDiscoveryProps {
    query: string;
    setQuery: (query: string) => void;
    isLoading: boolean;
    error: string | null;
    result: CompetitorDiscoveryResult | null;
    sources: GroundingChunk[];
    handleSubmit: () => Promise<void>;
}

const CompetitorCard: React.FC<{ competitor: Competitor }> = ({ competitor }) => (
    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 dark:bg-slate-700/50 dark:border-slate-700 flex items-start gap-4">
        {competitor.iconUrl ? (
            <img 
                src={competitor.iconUrl} 
                alt={`${competitor.type} icon`}
                className="w-12 h-12 rounded-md object-cover bg-slate-200 dark:bg-slate-700 flex-shrink-0"
            />
        ) : (
            <div className="w-12 h-12 rounded-md bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center" aria-label="Icon placeholder">
                <span className="text-xl text-slate-400 dark:text-slate-500">?</span>
            </div>
        )}
        <div className="flex-1">
            <h4 className="font-bold text-slate-800 dark:text-slate-100">{competitor.name}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{competitor.type}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{competitor.reason}</p>
        </div>
    </div>
);

const CompetitorDiscovery: React.FC<CompetitorDiscoveryProps> = ({
    query,
    setQuery,
    isLoading,
    error,
    result,
    sources,
    handleSubmit
}) => {
    const [placeholder, setPlaceholder] = useState('');

    useEffect(() => {
        setPlaceholder(DISCOVERY_SUGGESTIONS[Math.floor(Math.random() * DISCOVERY_SUGGESTIONS.length)]);
    }, []);
    
    const handleFormSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit();
    }, [handleSubmit]);

    const handleSelectSuggestion = useCallback((suggestion: string) => {
        setQuery(suggestion);
    }, [setQuery]);

    return (
        <div className="w-full">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg dark:bg-slate-800 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-1">Temukan Peta Persaingan Anda</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Masukkan produk, brand, atau layanan Anda untuk menemukan siapa saja kompetitor Anda di pasar.</p>
                <form onSubmit={handleFormSubmit}>
                    <div className="flex flex-col md:flex-row gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={`Contoh: ${placeholder}`}
                            className="flex-grow w-full min-w-0 px-4 py-3 text-slate-700 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder-gray-400 text-base dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !query.trim()}
                            className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed dark:disabled:from-slate-600 dark:disabled:to-slate-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30"
                        >
                            {isLoading ? 'Mencari...' : <><SparkleIcon className="w-5 h-5 mr-2" /> Cari Kompetitor</>}
                        </button>
                    </div>
                </form>
                {!query.trim() && !isLoading && !result && (
                    <PromptSuggestions 
                        suggestions={DISCOVERY_SUGGESTIONS} 
                        onSelectSuggestion={handleSelectSuggestion}
                    />
                )}
            </div>

            <div className="mt-8">
                {isLoading && <Loader messages={["Memindai pasar digital...", "Mengidentifikasi pemain kunci...", "Mengkategorikan kompetitor...", "Menyusun peta persaingan..."]} />}
                {error && <ErrorMessage message={error} />}
                {result && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AnalysisCard title="Kompetitor Langsung" icon={<SwordIcon className="w-5 h-5" />}>
                             <div className="space-y-4">
                                {result.directCompetitors.length > 0 ? (
                                    result.directCompetitors.map(comp => <CompetitorCard key={comp.name} competitor={comp} />)
                                ) : (
                                    <p className="text-slate-500 dark:text-slate-400">Tidak ada kompetitor langsung yang ditemukan.</p>
                                )}
                            </div>
                        </AnalysisCard>
                         <AnalysisCard title="Kompetitor Tidak Langsung" icon={<HandshakeIcon className="w-5 h-5" />} animationDelay="100ms">
                             <div className="space-y-4">
                                {result.indirectCompetitors.length > 0 ? (
                                    result.indirectCompetitors.map(comp => <CompetitorCard key={comp.name} competitor={comp} />)
                                ) : (
                                     <p className="text-slate-500 dark:text-slate-400">Tidak ada kompetitor tidak langsung yang ditemukan.</p>
                                )}
                            </div>
                        </AnalysisCard>
                        
                        {sources.length > 0 && (
                            <div className="lg:col-span-2 mt-2 text-sm animate-slide-fade-in" style={{ animationDelay: '200ms' }}>
                                <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Sumber Informasi:</h4>
                                <ul className="space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400">
                                    {sources.map((source, index) => (
                                        <li key={index}>
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-800 hover:underline dark:text-sky-400 dark:hover:text-sky-300">
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

export default CompetitorDiscovery;