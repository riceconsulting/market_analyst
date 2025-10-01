

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import type { SalesCopyResult } from '../../types';
import Loader from '../Loader';
import ErrorMessage from '../ErrorMessage';
import AnalysisCard from '../AnalysisCard';
import PromptSuggestions from '../PromptSuggestions';
import { RiskGauge } from '../DataViz';
import { CopyIcon, SparkleIcon, ChartBarIcon, ShieldCheckIcon } from '../Icons';

const SALES_COPY_SUGGESTIONS = [
    "Umumkan kenaikan harga karena kurs Dolar naik, tanpa kehilangan pelanggan.",
    "Jelaskan bahwa produk kami 'shrinkflation' (ukuran lebih kecil, harga sama).",
    "Buat copy permintaan maaf karena server down saat flash sale.",
    "Tulis syarat & ketentuan untuk program giveaway di Instagram.",
    "Komunikasikan keterlambatan pengiriman karena overload Lebaran.",
    "Respon tuduhan di medsos bahwa produk kami tidak halal.",
    "Buat FAQ tentang keamanan data pelanggan pasca kebocoran data.",
    "Bagaimana cara mengklarifikasi rumor negatif dari kompetitor?"
];

interface SalesCopyGeneratorProps {
    question: string;
    setQuestion: (question: string) => void;
    isLoading: boolean;
    error: string | null;
    result: SalesCopyResult | null;
    handleSubmit: () => Promise<void>;
}

const SalesCopyGenerator: React.FC<SalesCopyGeneratorProps> = ({
    question,
    setQuestion,
    isLoading,
    error,
    result,
    handleSubmit
}) => {
    const [placeholder, setPlaceholder] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        setPlaceholder(SALES_COPY_SUGGESTIONS[Math.floor(Math.random() * SALES_COPY_SUGGESTIONS.length)]);
    }, []);
    
    const handleFormSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit();
    }, [handleSubmit]);

    const handleSelectSuggestion = useCallback((suggestion: string) => {
        setQuestion(suggestion);
    }, [setQuestion]);

    const handleCopy = () => {
        if (result?.riskMitigationCopy) {
            const copyText = `${result.riskMitigationCopy.title}\n\n${result.riskMitigationCopy.body}`;
            navigator.clipboard.writeText(copyText).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            });
        }
    };
    
    const riskLevel = useMemo((): 'Low' | 'Medium' | 'High' => {
        if (!result?.marketReactionAnalysis) return 'Medium';
        const text = result.marketReactionAnalysis.toLowerCase();
        const highRiskKeywords = ['negatif', 'risiko tinggi', 'kehilangan kepercayaan', 'kontroversial', 'masalah serius', 'keluhan signifikan', 'viral negatif'];
        const mediumRiskKeywords = ['hati-hati', 'perhatikan', 'ambigu', 'netral', 'risiko sedang', 'potensi masalah'];

        if (highRiskKeywords.some(keyword => text.includes(keyword))) {
            return 'High';
        }
        if (mediumRiskKeywords.some(keyword => text.includes(keyword))) {
            return 'Medium';
        }
        return 'Low';
    }, [result]);

    return (
        <div className="w-full">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg dark:bg-slate-800 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-1">Generator Klausa & Copy Penjualan</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Ajukan pertanyaan bisnis untuk mendapatkan analisis risiko dan draft copy yang aman dan efektif.</p>
                <form onSubmit={handleFormSubmit}>
                    <div className="flex flex-col gap-2">
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder={`Contoh: ${placeholder}`}
                            className="flex-grow w-full px-4 py-3 text-slate-700 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent h-24 placeholder-gray-400 text-base dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !question.trim()}
                            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed dark:disabled:from-slate-600 dark:disabled:to-slate-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30"
                        >
                            {isLoading ? 'Menganalisis...' : <><SparkleIcon className="w-5 h-5 mr-2" /> Analisis & Buat Copy</>}
                        </button>
                    </div>
                </form>
                {!question.trim() && !isLoading && !result && (
                    <PromptSuggestions 
                        suggestions={SALES_COPY_SUGGESTIONS}
                        onSelectSuggestion={handleSelectSuggestion}
                    />
                )}
            </div>

            <div className="mt-8">
                {isLoading && <Loader messages={["Menganalisis skenario bisnis...", "Memproyeksikan reaksi pasar...", "Mengidentifikasi potensi risiko...", "Menyusun draf copy mitigasi..."]} />}
                {error && <ErrorMessage message={error} />}
                {result && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AnalysisCard title="Analisis Reaksi Pasar" icon={<ChartBarIcon className="w-5 h-5" />}>
                           <p>{result.marketReactionAnalysis}</p>
                           <RiskGauge level={riskLevel} />
                        </AnalysisCard>
                        <AnalysisCard title="Copy & Paste Ready" icon={<ShieldCheckIcon className="w-5 h-5" />} animationDelay="100ms">
                            <div className="relative p-4 border border-slate-200 rounded-md bg-slate-50 font-mono text-sm dark:border-slate-600 dark:bg-slate-900/30">
                                <button
                                    onClick={handleCopy}
                                    className="absolute top-2 right-2 p-2 text-slate-500 bg-white rounded-md hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                                    aria-label="Copy to clipboard"
                                >
                                    <CopyIcon className="w-5 h-5" />
                                </button>
                                {isCopied && <span className="absolute top-2 right-12 bg-slate-800 text-white text-xs px-2 py-1 rounded dark:bg-slate-200 dark:text-slate-800">Copied!</span>}

                                <h4 className="font-sans font-bold text-slate-800 dark:text-slate-100 text-lg mb-2">{result.riskMitigationCopy.title}</h4>
                                <p className="whitespace-pre-wrap font-sans dark:text-slate-300">{result.riskMitigationCopy.body}</p>
                            </div>
                        </AnalysisCard>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesCopyGenerator;