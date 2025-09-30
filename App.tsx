import React, { useState, useMemo, useCallback } from 'react';
import Header from './components/Header';
import NicheTrendAnalysis from './components/features/NicheTrendAnalysis';
import CompetitorAnalysis from './components/features/CompetitorAnalysis';
import SalesCopyGenerator from './components/features/SalesCopyGenerator';
import TabButton from './components/TabButton';
import { NicheIcon, CompetitorIcon, CopyIcon } from './components/Icons';
import { NicheTrendResult, CompetitorAnalysisResult, SalesCopyResult, GroundingChunk, HistoryItem } from './types';
import { analyzeNicheTrend, analyzeCompetitor, generateSalesCopy } from './services/geminiService';
import Footer from './components/Footer';
import { useHistory } from './hooks/useHistory';
import HistoryPanel from './components/HistoryPanel';


type Feature = 'niche' | 'competitor' | 'copy';

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature>('niche');
  const { addHistoryItem } = useHistory();

  // State for Niche Trend Analysis
  const [nicheKeywords, setNicheKeywords] = useState('');
  const [nicheIsLoading, setNicheIsLoading] = useState(false);
  const [nicheError, setNicheError] = useState<string | null>(null);
  const [nicheResult, setNicheResult] = useState<NicheTrendResult | null>(null);

  // State for Competitor Analysis
  const [competitorIdentifier, setCompetitorIdentifier] = useState('');
  const [competitorIsLoading, setCompetitorIsLoading] = useState(false);
  const [competitorError, setCompetitorError] = useState<string | null>(null);
  const [competitorResult, setCompetitorResult] = useState<CompetitorAnalysisResult | null>(null);
  const [competitorSources, setCompetitorSources] = useState<GroundingChunk[]>([]);

  // State for Sales Copy Generator
  const [salesQuestion, setSalesQuestion] = useState('');
  const [salesCopyIsLoading, setSalesCopyIsLoading] = useState(false);
  const [salesCopyError, setSalesCopyError] = useState<string | null>(null);
  const [salesCopyResult, setSalesCopyResult] = useState<SalesCopyResult | null>(null);


  const handleNicheSubmit = useCallback(async () => {
    const trimmedKeywords = nicheKeywords.trim();
    if (!trimmedKeywords) {
        setNicheError("Mohon masukkan kata kunci produk atau industri Anda.");
        return;
    }
    if (trimmedKeywords.length < 3) {
        setNicheError("Kata kunci terlalu pendek, mohon masukkan minimal 3 karakter.");
        return;
    }
     if (trimmedKeywords.length > 100) {
        setNicheError("Kata kunci terlalu panjang, mohon ringkas dalam 100 karakter.");
        return;
    }

    setNicheIsLoading(true);
    setNicheError(null);
    setNicheResult(null);
    try {
        const analysisResult = await analyzeNicheTrend(trimmedKeywords);
        setNicheResult(analysisResult);
        addHistoryItem({ type: 'niche', query: trimmedKeywords, result: analysisResult });
    } catch (err) {
        console.error(err);
        setNicheError("Gagal melakukan analisis. Silakan coba lagi nanti.");
    } finally {
        setNicheIsLoading(false);
    }
  }, [nicheKeywords, addHistoryItem]);

  const handleCompetitorSubmit = useCallback(async () => {
    const trimmedIdentifier = competitorIdentifier.trim();
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/i;
    const socialRegex = /^@?[\w.]{1,30}$/i;

    if (!trimmedIdentifier) {
        setCompetitorError("Mohon masukkan URL produk atau nama toko kompetitor.");
        return;
    }
    if (!urlRegex.test(trimmedIdentifier) && !socialRegex.test(trimmedIdentifier)) {
        setCompetitorError("Format tidak valid. Masukkan URL (e.g., shopee.co.id/brand) atau handle sosial media (e.g., @brand).");
        return;
    }

      setCompetitorIsLoading(true);
      setCompetitorError(null);
      setCompetitorResult(null);
      setCompetitorSources([]);
      try {
          const { analysis, sources } = await analyzeCompetitor(trimmedIdentifier);
          if (!analysis) {
            throw new Error("AI tidak dapat memproses respons. Coba dengan input yang berbeda.");
          }
          setCompetitorResult(analysis);
          setCompetitorSources(sources);
          addHistoryItem({ type: 'competitor', query: trimmedIdentifier, result: analysis, sources });
      } catch (err) {
          console.error(err);
          const errorMessage = err instanceof Error ? err.message : "Gagal melakukan analisis. Silakan coba lagi nanti.";
          setCompetitorError(errorMessage);
      } finally {
          setCompetitorIsLoading(false);
      }
  }, [competitorIdentifier, addHistoryItem]);

  const handleSalesCopySubmit = useCallback(async () => {
    const trimmedQuestion = salesQuestion.trim();
    if (!trimmedQuestion) {
        setSalesCopyError("Mohon masukkan pertanyaan bisnis spesifik Anda.");
        return;
    }
    if (trimmedQuestion.split(/\s+/).length < 5) {
        setSalesCopyError("Pertanyaan terlalu singkat. Mohon jelaskan skenario Anda setidaknya dalam 5 kata.");
        return;
    }
     if (trimmedQuestion.length > 300) {
        setSalesCopyError("Pertanyaan terlalu panjang. Mohon ringkas pertanyaan Anda dalam 300 karakter.");
        return;
    }

      setSalesCopyIsLoading(true);
      setSalesCopyError(null);
      setSalesCopyResult(null);
      try {
          const copyResult = await generateSalesCopy(trimmedQuestion);
          setSalesCopyResult(copyResult);
          addHistoryItem({ type: 'copy', query: trimmedQuestion, result: copyResult });
      } catch (err) {
          console.error(err);
          setSalesCopyError("Gagal menghasilkan copy. Silakan coba lagi nanti.");
      } finally {
          setSalesCopyIsLoading(false);
      }
  }, [salesQuestion, addHistoryItem]);
  
  const loadFromHistory = useCallback((item: HistoryItem) => {
    setNicheError(null);
    setCompetitorError(null);
    setSalesCopyError(null);
    
    setActiveFeature(item.type);

    switch (item.type) {
        case 'niche':
            setNicheKeywords(item.query);
            setNicheResult(item.result as NicheTrendResult);
            setCompetitorResult(null);
            setSalesCopyResult(null);
            break;
        case 'competitor':
            setCompetitorIdentifier(item.query);
            setCompetitorResult(item.result as CompetitorAnalysisResult);
            setCompetitorSources(item.sources || []);
            setNicheResult(null);
            setSalesCopyResult(null);
            break;
        case 'copy':
            setSalesQuestion(item.query);
            setSalesCopyResult(item.result as SalesCopyResult);
            setNicheResult(null);
            setCompetitorResult(null);
            break;
    }
  }, []);


  const features = useMemo(() => [
    { id: 'niche', label: 'Analisis Tren Niche', icon: <NicheIcon className="w-5 h-5 mr-2" /> },
    { id: 'competitor', label: 'Riset Kompetitor', icon: <CompetitorIcon className="w-5 h-5 mr-2" /> },
    { id: 'copy', label: 'Generator Copy Penjualan', icon: <CopyIcon className="w-5 h-5 mr-2" /> },
  ], []);


  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 pb-32 sm:pb-36">
        <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight">AI Market Analyst for SMEs</h1>
            <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">Instant, data-driven insights to fuel your business growth in Indonesia.</p>
        </div>
        
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 sm:space-x-2 bg-slate-100 p-1 rounded-full" role="tablist">
            {features.map((feature) => (
              <TabButton
                key={feature.id}
                isActive={activeFeature === feature.id}
                onClick={() => setActiveFeature(feature.id as Feature)}
              >
                {feature.icon}
                <span className="hidden sm:inline">{feature.label}</span>
                 <span className="sm:hidden">{feature.id.charAt(0).toUpperCase() + feature.id.slice(1)}</span>
              </TabButton>
            ))}
          </div>
        </div>

        <div>
          <div className={activeFeature === 'niche' ? 'block' : 'hidden'}>
            <NicheTrendAnalysis 
              keywords={nicheKeywords}
              setKeywords={setNicheKeywords}
              isLoading={nicheIsLoading}
              error={nicheError}
              result={nicheResult}
              handleSubmit={handleNicheSubmit}
            />
          </div>
          <div className={activeFeature === 'competitor' ? 'block' : 'hidden'}>
            <CompetitorAnalysis 
              identifier={competitorIdentifier}
              setIdentifier={setCompetitorIdentifier}
              isLoading={competitorIsLoading}
              error={competitorError}
              result={competitorResult}
              sources={competitorSources}
              handleSubmit={handleCompetitorSubmit}
            />
          </div>
          <div className={activeFeature === 'copy' ? 'block' : 'hidden'}>
            <SalesCopyGenerator
              question={salesQuestion}
              setQuestion={setSalesQuestion}
              isLoading={salesCopyIsLoading}
              error={salesCopyError}
              result={salesCopyResult}
              handleSubmit={handleSalesCopySubmit}
            />
          </div>
        </div>
      </main>
      <HistoryPanel onLoadFromHistory={loadFromHistory} />
      <Footer />
    </div>
  );
};

export default App;