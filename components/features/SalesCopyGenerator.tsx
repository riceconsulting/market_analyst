import React, { useCallback, useState, useEffect, useMemo } from 'react';
import type { SalesCopyResult } from '../../types';
import Loader from '../Loader';
import ErrorMessage from '../ErrorMessage';
import AnalysisCard from '../AnalysisCard';
import PromptSuggestions from '../PromptSuggestions';
import { RiskGauge } from '../DataViz';
import { CopyIcon } from '../Icons';

const SALES_COPY_SUGGESTIONS = [
    "Bagaimana cara mengumumkan diskon besar tanpa terlihat murahan?",
    "Buat klausa pengembalian barang yang adil untuk pelanggan dan bisnis.",
    "Apa cara terbaik mengkomunikasikan keterlambatan pengiriman saat event 12.12?",
    "Bagaimana cara menaikkan harga produk sebesar 15% tanpa kehilangan pelanggan?",
    "Tulis pengumuman bahwa produk kami sekarang menggunakan bahan daur ulang.",
    "Bagaimana cara merespon ulasan negatif bintang 1 secara profesional?",
    "Buat copy untuk launching produk baru yang sangat ditunggu-tunggu.",
    "Bagaimana cara menjelaskan perubahan formula produk kepada pelanggan setia?"
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
        <div className="w-full animate-fade-in">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-800 mb-1">Generator Klausa & Copy Penjualan</h2>
                <p className="text-slate-600 mb-4">Ajukan pertanyaan bisnis untuk mendapatkan analisis risiko dan draft copy yang aman dan efektif.</p>
                <form onSubmit={handleFormSubmit}>
                    <div className="flex flex-col gap-2">
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder={`Contoh: ${placeholder}`}
                            className="flex-grow w-full px-4 py-3 text-slate-700 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent h-24 placeholder-gray-400 text-base"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !question.trim()}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
                        >
                            {isLoading ? 'Menganalisis...' : 'Analisis & Buat Copy'}
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
                        <AnalysisCard title="Analisis Reaksi Pasar" icon={"📈"}>
                           <p>{result.marketReactionAnalysis}</p>
                           <RiskGauge level={riskLevel} />
                        </AnalysisCard>
                        <AnalysisCard title="Copy & Paste Ready" icon={"🛡️"}>
                            <div className="relative p-4 border border-slate-200 rounded-md bg-slate-50 font-mono text-sm">
                                <button
                                    onClick={handleCopy}
                                    className="absolute top-2 right-2 p-2 text-slate-500 bg-white rounded-md hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    aria-label="Copy to clipboard"
                                >
                                    <CopyIcon className="w-5 h-5" />
                                </button>
                                {isCopied && <span className="absolute top-2 right-12 bg-slate-800 text-white text-xs px-2 py-1 rounded">Copied!</span>}

                                <h4 className="font-sans font-bold text-slate-800 text-lg mb-2">{result.riskMitigationCopy.title}</h4>
                                <p className="whitespace-pre-wrap font-sans">{result.riskMitigationCopy.body}</p>
                            </div>
                        </AnalysisCard>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesCopyGenerator;