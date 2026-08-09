


import React, { useCallback, useState, useEffect, useMemo } from 'react';
import type { SalesCopyResult } from '../../types';
import Loader from '../Loader';
import ErrorMessage from '../ErrorMessage';
import AnalysisCard from '../AnalysisCard';
import PromptSuggestions from '../PromptSuggestions';
import SampleOutput from '../SampleOutput';
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
            <div className="bg-white p-6 rounded-xl border border-border-light dark:border-border-dark shadow-lg dark:bg-surface-dark dark:border-border-light dark:border-border-dark">
                <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-1">Generator Klausa & Copy Penjualan</h2>
                <p className="text-text-primary-light dark:text-text-primary-dark mb-4">Ajukan pertanyaan bisnis untuk mendapatkan analisis risiko dan draft copy yang aman dan efektif.</p>
                <form onSubmit={handleFormSubmit}>
                    <div className="flex flex-col gap-2">
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder={`Contoh: ${placeholder}`}
                            className="flex-grow w-full px-4 py-3 text-text-primary-light dark:text-text-primary-dark bg-white border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent h-24 placeholder-gray-400 text-base dark:bg-surface-dark dark:border-border-light dark:border-border-dark dark:text-text-primary-light dark:text-text-primary-dark dark:placeholder-slate-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !question.trim()}
                            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:bg-surface-light dark:bg-surface-dark disabled:cursor-not-allowed dark:disabled:bg-surface-light dark:bg-surface-dark transition-all duration-300 transform hover:scale-105"
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
                {!question.trim() && !isLoading && !result && (
                    <SampleOutput
                        title="Sample Output: Umumkan Kenaikan Harga"
                        description="Copy untuk mengumumkan kenaikan harga karena kurs Dolar naik"
                    >
                        <div className="space-y-4">
                            <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                                <h4 className="font-semibold text-accent-light dark:text-accent-dark mb-2">Judul</h4>
                                <p className="text-sm text-text-primary-light dark:text-text-primary-dark">Penting: Penyesuaian Harga Produk Kami per XX Bulan 2024</p>
                            </div>
                            <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                                <h4 className="font-semibold text-accent-light dark:text-accent-dark mb-2">Isi Copy</h4>
                                <p className="text-sm text-text-primary-light dark:text-text-primary-dark whitespace-pre-wrap">Halo Valued Customer,\n\nKami ingin memberitahukan bahwa mulai tanggal [Tanggal], akan ada penyesuaian harga pada beberapa produk kami.\n\nMengapa?\nKurs Dolar yang naik signifikan dalam 3 bulan terakhir mempengaruhi biaya bahan baku impor kami.\n\nYang tidak berubah:\n✅ Kualitas produk tetap terjamin\n✅ Layanan pelanggan tetap prima\n✅ Garansi tetap berlaku\n\nTerima kasih atas pengertian dan dukungan Anda. 🙏</p>
                            </div>
                            <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                                <h4 className="font-semibold text-accent-light dark:text-accent-dark mb-2">Analisis Risiko</h4>
                                <p className="text-sm text-text-primary-light dark:text-text-primary-dark">Skor Risiko: 3/10 (Rendah) - Copy transparan dan jujur, menghindari phrasing yang bisa memicu emosi negatif.</p>
                            </div>
                        </div>
                    </SampleOutput>
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
                            <div className="relative p-4 border border-border-light dark:border-border-dark rounded-md bg-surface-light dark:bg-surface-dark font-mono text-sm dark:border-border-light dark:border-border-dark dark:bg-surface-dark/30">
                                <button
                                    onClick={handleCopy}
                                    className="absolute top-2 right-2 p-2 text-text-primary-light dark:text-text-primary-dark bg-white rounded-md hover:bg-surface-light dark:bg-surface-dark hover:text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-brand dark:bg-surface-dark dark:text-text-primary-light dark:text-text-primary-dark dark:hover:bg-surface-dark dark:hover:text-text-primary-dark"
                                    aria-label="Copy to clipboard"
                                >
                                    <CopyIcon className="w-5 h-5" />
                                </button>
                                {isCopied && <span className="absolute top-2 right-12 bg-surface-light dark:bg-surface-dark text-white text-xs px-2 py-1 rounded dark:bg-surface-dark dark:text-text-primary-light dark:text-text-primary-dark">Copied!</span>}

                                <h4 className="font-sans font-bold text-text-primary-light dark:text-text-primary-dark text-lg mb-2">{result.riskMitigationCopy.title}</h4>
                                <p className="whitespace-pre-wrap font-sans dark:text-text-primary-light dark:text-text-primary-dark">{result.riskMitigationCopy.body}</p>
                            </div>
                        </AnalysisCard>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesCopyGenerator;