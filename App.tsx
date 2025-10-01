



import React, { useState, useMemo, useCallback } from 'react';
import Header from './components/Header';
import NicheTrendAnalysis from './components/features/NicheTrendAnalysis';
import CompetitorAnalysis from './components/features/CompetitorAnalysis';
import SalesCopyGenerator from './components/features/SalesCopyGenerator';
import CompetitorDiscovery from './components/features/CompetitorDiscovery';
import TabButton from './components/TabButton';
import { NicheIcon, CompetitorIcon, CopyIcon, DiscoveryIcon } from './components/Icons';
import { NicheTrendResult, CompetitorAnalysisResult, SalesCopyResult, GroundingChunk, HistoryItem, CompetitorDiscoveryResult } from './types';
import { analyzeNicheTrend, analyzeCompetitor, generateSalesCopy, discoverCompetitors } from './services/geminiService';
import Footer from './components/Footer';
import { useHistory } from './hooks/useHistory';
import HistoryPanel from './components/HistoryPanel';


type Feature = 'niche' | 'competitor' | 'copy' | 'discovery';

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
  const [competitorFocusKeywords, setCompetitorFocusKeywords] = useState('');
  const [competitorIsLoading, setCompetitorIsLoading] = useState(false);
  const [competitorError, setCompetitorError] = useState<string | null>(null);
  const [competitorResult, setCompetitorResult] = useState<CompetitorAnalysisResult | null>(null);
  const [competitorSources, setCompetitorSources] = useState<GroundingChunk[]>([]);

  // State for Sales Copy Generator
  const [salesQuestion, setSalesQuestion] = useState('');
  const [salesCopyIsLoading, setSalesCopyIsLoading] = useState(false);
  const [salesCopyError, setSalesCopyError] = useState<string | null>(null);
  const [salesCopyResult, setSalesCopyResult] = useState<SalesCopyResult | null>(null);

  // State for Competitor Discovery
  const [discoveryQuery, setDiscoveryQuery] = useState('');
  const [discoveryIsLoading, setDiscoveryIsLoading] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [discoveryResult, setDiscoveryResult] = useState<CompetitorDiscoveryResult | null>(null);
  const [discoverySources, setDiscoverySources] = useState<GroundingChunk[]>([]);


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
        if (!navigator.onLine) {
            setNicheError("Koneksi internet Anda terputus. Mohon periksa koneksi Anda dan coba lagi.");
        } else {
            const errorMessage = err instanceof Error ? err.message : "Gagal melakukan analisis. Silakan coba lagi nanti.";
            setNicheError(errorMessage);
        }
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
    if (competitorFocusKeywords.length > 150) {
        setCompetitorError("Kata kunci fokus terlalu panjang, mohon ringkas dalam 150 karakter.");
        return;
    }

      setCompetitorIsLoading(true);
      setCompetitorError(null);
      setCompetitorResult(null);
      setCompetitorSources([]);
      try {
          const { analysis, sources } = await analyzeCompetitor(trimmedIdentifier, competitorFocusKeywords);
          setCompetitorResult(analysis);
          setCompetitorSources(sources);
          addHistoryItem({ type: 'competitor', query: trimmedIdentifier, focusKeywords: competitorFocusKeywords, result: analysis, sources });
      } catch (err) {
          console.error(err);
          if (!navigator.onLine) {
            setCompetitorError("Koneksi internet Anda terputus. Mohon periksa koneksi Anda dan coba lagi.");
          } else {
            const errorMessage = err instanceof Error ? err.message : "Gagal melakukan analisis. Silakan coba lagi nanti.";
            setCompetitorError(errorMessage);
          }
      } finally {
          setCompetitorIsLoading(false);
      }
  }, [competitorIdentifier, competitorFocusKeywords, addHistoryItem]);

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
          if (!navigator.onLine) {
            setSalesCopyError("Koneksi internet Anda terputus. Mohon periksa koneksi Anda dan coba lagi.");
          } else {
            const errorMessage = err instanceof Error ? err.message : "Gagal menghasilkan copy. Silakan coba lagi nanti.";
            setSalesCopyError(errorMessage);
          }
      } finally {
          setSalesCopyIsLoading(false);
      }
  }, [salesQuestion, addHistoryItem]);
  
  const handleDiscoverySubmit = useCallback(async () => {
    const trimmedQuery = discoveryQuery.trim();
    if (!trimmedQuery) {
        setDiscoveryError("Mohon masukkan produk, brand, atau layanan Anda.");
        return;
    }
    if (trimmedQuery.length < 3) {
        setDiscoveryError("Input terlalu pendek, mohon masukkan minimal 3 karakter.");
        return;
    }
    if (trimmedQuery.length > 100) {
        setDiscoveryError("Input terlalu panjang, mohon ringkas dalam 100 karakter.");
        return;
    }

    setDiscoveryIsLoading(true);
    setDiscoveryError(null);
    setDiscoveryResult(null);
    setDiscoverySources([]);
    try {
        const { analysis, sources } = await discoverCompetitors(trimmedQuery);
        setDiscoveryResult(analysis);
        setDiscoverySources(sources);
        addHistoryItem({ type: 'discovery', query: trimmedQuery, result: analysis, sources });
    } catch (err) {
        console.error(err);
        if (!navigator.onLine) {
            setDiscoveryError("Koneksi internet Anda terputus. Mohon periksa koneksi Anda dan coba lagi.");
        } else {
            const errorMessage = err instanceof Error ? err.message : "Gagal menemukan kompetitor. Silakan coba lagi nanti.";
            setDiscoveryError(errorMessage);
        }
    } finally {
        setDiscoveryIsLoading(false);
    }
}, [discoveryQuery, addHistoryItem]);
  
  const loadFromHistory = useCallback((item: HistoryItem) => {
    setNicheError(null);
    setCompetitorError(null);
    setSalesCopyError(null);
    setDiscoveryError(null);
    
    setActiveFeature(item.type);

    switch (item.type) {
        case 'niche':
            setNicheKeywords(item.query);
            setNicheResult(item.result as NicheTrendResult);
            setCompetitorResult(null);
            setSalesCopyResult(null);
            setDiscoveryResult(null);
            setCompetitorFocusKeywords('');
            break;
        case 'competitor':
            setCompetitorIdentifier(item.query);
            setCompetitorFocusKeywords(item.focusKeywords || '');
            setCompetitorResult(item.result as CompetitorAnalysisResult);
            setCompetitorSources(item.sources || []);
            setNicheResult(null);
            setSalesCopyResult(null);
            setDiscoveryResult(null);
            break;
        case 'copy':
            setSalesQuestion(item.query);
            setSalesCopyResult(item.result as SalesCopyResult);
            setNicheResult(null);
            setCompetitorResult(null);
            setDiscoveryResult(null);
            setCompetitorFocusKeywords('');
            break;
        case 'discovery':
            setDiscoveryQuery(item.query);
            setDiscoveryResult(item.result as CompetitorDiscoveryResult);
            setDiscoverySources(item.sources || []);
            setNicheResult(null);
            setCompetitorResult(null);
            setSalesCopyResult(null);
            setCompetitorFocusKeywords('');
            break;
    }
  }, []);


  const features = useMemo(() => [
    { id: 'niche', label: 'Analisis Tren Niche', icon: <NicheIcon className="w-5 h-5 mr-2" /> },
    { id: 'discovery', label: 'Temukan Kompetitor', icon: <DiscoveryIcon className="w-5 h-5 mr-2" /> },
    { id: 'competitor', label: 'Riset Kompetitor', icon: <CompetitorIcon className="w-5 h-5 mr-2" /> },
    { id: 'copy', label: 'Generator Copy Penjualan', icon: <CopyIcon className="w-5 h-5 mr-2" /> },
  ], []);


  return (
    <div className="min-h-screen bg-slate-50 font-sans dark:bg-slate-900">
      <Header />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-32 sm:pb-36">
        <div className="text-center mb-8 sm:mb-10 animate-slide-fade-in">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-dark to-brand-light">AI Market Analyst</h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto dark:text-slate-400">Instant, data-driven insights to fuel your business growth in Indonesia.</p>
        </div>
        
        <div className="flex justify-center mb-6 sm:mb-8 animate-slide-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2 bg-slate-100 p-2 sm:p-1 rounded-lg sm:rounded-full dark:bg-slate-800" role="tablist">
            {features.map((feature) => (
              <TabButton
                key={feature.id}
                isActive={activeFeature === feature.id}
                onClick={() => setActiveFeature(feature.id as Feature)}
              >
                {feature.icon}
                <span>{feature.label}</span>
              </TabButton>
            ))}
          </div>
        </div>

        <div key={activeFeature} className="animate-slide-fade-in" style={{ animationDelay: '200ms' }}>
          {activeFeature === 'niche' && (
            <NicheTrendAnalysis 
              keywords={nicheKeywords}
              setKeywords={setNicheKeywords}
              isLoading={nicheIsLoading}
              error={nicheError}
              result={nicheResult}
              handleSubmit={handleNicheSubmit}
            />
          )}
          {activeFeature === 'discovery' && (
              <CompetitorDiscovery
                  query={discoveryQuery}
                  setQuery={setDiscoveryQuery}
                  isLoading={discoveryIsLoading}
                  error={discoveryError}
                  result={discoveryResult}
                  sources={discoverySources}
                  handleSubmit={handleDiscoverySubmit}
              />
          )}
          {activeFeature === 'competitor' && (
            <CompetitorAnalysis 
              identifier={competitorIdentifier}
              setIdentifier={setCompetitorIdentifier}
              focusKeywords={competitorFocusKeywords}
              setFocusKeywords={setCompetitorFocusKeywords}
              isLoading={competitorIsLoading}
              error={competitorError}
              result={competitorResult}
              sources={competitorSources}
              handleSubmit={handleCompetitorSubmit}
            />
          )}
          {activeFeature === 'copy' && (
            <SalesCopyGenerator
              question={salesQuestion}
              setQuestion={setSalesQuestion}
              isLoading={salesCopyIsLoading}
              error={salesCopyError}
              result={salesCopyResult}
              handleSubmit={handleSalesCopySubmit}
            />
          )}
        </div>
      </main>
      <HistoryPanel onLoadFromHistory={loadFromHistory} />
      <Footer />
    </div>
  );
};

export default App;