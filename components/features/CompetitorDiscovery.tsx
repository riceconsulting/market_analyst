



import React, { useCallback, useState, useEffect } from 'react';
import type { CompetitorDiscoveryResult, GroundingChunk, Competitor } from '../../types';
import Loader from '../Loader';
import ErrorMessage from '../ErrorMessage';
import AnalysisCard from '../AnalysisCard';
import PromptSuggestions from '../PromptSuggestions';
import SampleOutput from '../SampleOutput';
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
    <div className="p-4 border border-border-light dark:border-border-dark rounded-lg bg-surface-light dark:bg-surface-dark dark:bg-surface-dark/50 dark:border-border-dark">
        <div>
            <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark">{competitor.name}</h4>
            <p className="text-xs text-text-primary-light dark:text-text-primary-dark mb-2">{competitor.type}</p>
            <p className="text-sm text-text-primary-light dark:text-text-primary-dark">{competitor.reason}</p>
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
            <div className="bg-white p-6 rounded-xl border border-border-light dark:border-border-dark shadow-lg dark:bg-surface-dark dark:border-border-dark">
                <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-1">Temukan Peta Persaingan Anda</h2>
                <p className="text-text-primary-light dark:text-text-primary-dark mb-4">Masukkan produk, brand, atau layanan Anda untuk menemukan siapa saja kompetitor Anda di pasar.</p>
                <form onSubmit={handleFormSubmit}>
                    <div className="flex flex-col md:flex-row gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={`Contoh: ${placeholder}`}
                            className="flex-grow w-full min-w-0 px-4 py-3 text-text-primary-light dark:text-text-primary-dark bg-white border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent placeholder-gray-400 text-base dark:bg-surface-dark dark:border-border-dark dark:text-text-primary-light dark:text-text-primary-dark dark:placeholder-slate-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !query.trim()}
                            className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:bg-surface-light dark:bg-surface-dark disabled:cursor-not-allowed dark:disabled:bg-surface-light dark:bg-surface-dark transition-all duration-300 transform hover:scale-105"
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
                {!query.trim() && !isLoading && !result && (
                    <SampleOutput
                        title="Sample Output: Brand Modest Fashion B2C"
                        description="Peta persaingan untuk brand fashion muslim modern"
                    >
                        <div className="space-y-4">
                            <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                                <h4 className="font-semibold text-accent-light dark:text-accent-dark mb-2">Kompetitor Langsung</h4>
                                <ul className="space-y-2 text-sm text-text-primary-light dark:text-text-primary-dark">
                                    <li>• <strong>Hijabook</strong> - Brand fashion muslim premium dengan fokus pada material berkualitas tinggi</li>
                                    <li>• <strong>By.anne</strong> - Brand modest fashion dengan gaya minimalis modern</li>
                                </ul>
                            </div>
                            <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                                <h4 className="font-semibold text-accent-light dark:text-accent-dark mb-2">Kompetitor Tidak Langsung</h4>
                                <ul className="space-y-2 text-sm text-text-primary-light dark:text-text-primary-dark">
                                    <li>• <strong>Zalora</strong> - Marketplace fashion online dengan segmen muslim fashion</li>
                                    <li>• <strong>Shopee</strong> - Platform e-commerce dengan ribuan seller fashion muslim</li>
                                </ul>
                            </div>
                        </div>
                    </SampleOutput>
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
                                    <p className="text-text-primary-light dark:text-text-primary-dark">Tidak ada kompetitor langsung yang ditemukan.</p>
                                )}
                            </div>
                        </AnalysisCard>
                         <AnalysisCard title="Kompetitor Tidak Langsung" icon={<HandshakeIcon className="w-5 h-5" />} animationDelay="100ms">
                             <div className="space-y-4">
                                {result.indirectCompetitors.length > 0 ? (
                                    result.indirectCompetitors.map(comp => <CompetitorCard key={comp.name} competitor={comp} />)
                                ) : (
                                     <p className="text-text-primary-light dark:text-text-primary-dark">Tidak ada kompetitor tidak langsung yang ditemukan.</p>
                                )}
                            </div>
                        </AnalysisCard>
                        
                        {sources.length > 0 && (
                            <div className="lg:col-span-2 mt-2 text-sm animate-slide-fade-in" style={{ animationDelay: '200ms' }}>
                                <h4 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">Sumber Informasi:</h4>
                                <ul className="space-y-1 list-disc list-inside text-text-primary-light dark:text-text-primary-dark">
                                    {sources.map((source, index) => (
                                        <li key={index}>
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-brand hover:text-brand-dark hover:underline dark:text-brand-light dark:hover:text-brand">
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