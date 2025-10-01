import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';

// For NicheTrendAnalysis
interface LifecycleGraphProps {
    activePhase: 'Baru' | 'Berkembang' | 'Matang' | 'Menurun';
}

const phaseDescriptions = {
    'Baru': 'Tren baru muncul, adopsi masih rendah. Peluang bagi inovator untuk menjadi pionir.',
    'Berkembang': 'Minat pasar meningkat, kompetisi mulai muncul. Waktu yang tepat untuk masuk dan membangun pangsa pasar.',
    'Matang': 'Tren sudah mapan dan diadopsi secara luas. Fokus pada diferensiasi dan efisiensi untuk bersaing.',
    'Menurun': 'Minat dan relevansi mulai menurun. Pertimbangkan untuk pivot atau mencari tren baru.',
};

export const LifecycleGraph: React.FC<LifecycleGraphProps> = ({ activePhase }) => {
    const { theme } = useTheme();
    const [tooltip, setTooltip] = useState<{ content: string; x: number } | null>(null);

    const phaseConfig = {
        'Baru': { cxPercentage: 15, color: '#5890AD' },
        'Berkembang': { cxPercentage: 40, color: '#5890AD' },
        'Matang': { cxPercentage: 65, color: '#5890AD' },
        'Menurun': { cxPercentage: 90, color: '#5890AD' },
    };

    const activePhaseConfig = phaseConfig[activePhase];
    const activeTextColor = theme === 'dark' ? '#38bdf8' : '#5890AD';
    const inactiveTextColor = theme === 'dark' ? '#94a3b8' : '#64748b';

    const svgWidth = 300;
    const svgHeight = 70; // Increased height for tooltip space

    const handleMouseOver = (phase: keyof typeof phaseDescriptions, cxPercentage: number) => {
        setTooltip({
            content: phaseDescriptions[phase],
            x: (cxPercentage / 100) * svgWidth,
        });
    };

    const handleMouseOut = () => {
        setTooltip(null);
    };

    return (
        <div className="mt-3">
             <div className="w-full" aria-label={`Trend lifecycle phase: ${activePhase}`}>
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto" style={{ overflow: 'visible' }}>
                    <g transform="translate(0, 10)">
                        {/* S-Curve Path */}
                        <path d="M 10 50 Q 75 50, 100 30 T 190 20 Q 250 10, 290 10" className="stroke-slate-300 dark:stroke-gray-700" strokeWidth="2" fill="none" />
                        
                        {/* Active Phase Indicator */}
                        <g style={{ transform: `translateX(calc(${activePhaseConfig.cxPercentage}% - 50%))`, transition: 'transform 0.5s ease-in-out' }}>
                             <circle cx="50%" cy={activePhase === 'Baru' ? 42 : activePhase === 'Berkembang' ? 32 : activePhase === 'Matang' ? 20 : 12} r="5" fill={activePhaseConfig.color} className="stroke-white dark:stroke-gray-800" strokeWidth="2">
                                 <animate attributeName="r" values="5;7;5" dur="1.5s" repeatCount="indefinite" />
                             </circle>
                        </g>
                    </g>
                    
                    {/* Phase labels - interactive */}
                    {Object.entries(phaseConfig).map(([phase, config]) => (
                        <g 
                            key={phase} 
                            onMouseOver={() => handleMouseOver(phase as keyof typeof phaseDescriptions, config.cxPercentage)}
                            onMouseOut={handleMouseOut}
                            style={{ cursor: 'help' }}
                        >
                            {/* Hitbox */}
                            <rect x={(config.cxPercentage / 100 * svgWidth) - 20} y="50" width="40" height="20" fill="transparent" />
                            <text 
                                x={`${config.cxPercentage}%`} 
                                y="65" 
                                textAnchor="middle" 
                                fontSize="10" 
                                fill={phase === activePhase ? activeTextColor : inactiveTextColor} 
                                fontWeight={phase === activePhase ? '600' : '400'}
                                className="pointer-events-none"
                            >
                                {phase}
                            </text>
                        </g>
                    ))}

                     {/* Tooltip */}
                    {tooltip && (
                        <g transform={`translate(${tooltip.x}, 0)`} className="pointer-events-none transition-opacity duration-200" style={{ opacity: 1 }}>
                            <foreignObject x="-75" y="0" width="150" height="45">
                                <div 
                                    xmlns="http://www.w3.org/1999/xhtml" 
                                    className="p-2 text-center text-xs text-white bg-slate-800/90 dark:bg-slate-200/90 dark:text-slate-800 rounded-md shadow-lg h-full flex items-center justify-center"
                                >
                                    {tooltip.content}
                                </div>
                            </foreignObject>
                        </g>
                    )}
                </svg>
            </div>
        </div>
    );
};


// For CompetitorAnalysis
interface CompetitorData {
    name: string;
    priceRange?: [number, number] | null;
}

interface PricingBenchmarkChartProps {
    mainCompetitor: CompetitorData;
    benchmarkData: CompetitorData[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value).replace(/\s/g, '');
};

export const PricingBenchmarkChart: React.FC<PricingBenchmarkChartProps> = ({ mainCompetitor, benchmarkData }) => {
    const allCompetitors = useMemo(() => [mainCompetitor, ...benchmarkData], [mainCompetitor, benchmarkData]);

    const competitorsWithRanges = useMemo(() => 
        allCompetitors.filter(c => c.priceRange && c.priceRange.length === 2 && c.priceRange[1] >= c.priceRange[0]),
        [allCompetitors]
    );

    const { overallMin, overallMax } = useMemo(() => {
        if (competitorsWithRanges.length === 0) return { overallMin: 0, overallMax: 0 };
        const allPrices = competitorsWithRanges.flatMap(c => c.priceRange!);
        return {
            overallMin: Math.min(...allPrices),
            overallMax: Math.max(...allPrices),
        };
    }, [competitorsWithRanges]);

    if (competitorsWithRanges.length === 0) {
        return <p className="text-sm text-center text-slate-500 dark:text-slate-400 py-4">Data rentang harga tidak cukup untuk membuat perbandingan.</p>;
    }

    const totalRange = overallMax - overallMin;

    return (
        <div className="space-y-4" aria-label="Grafik perbandingan harga kompetitor">
            {competitorsWithRanges.map((competitor, index) => {
                const [min, max] = competitor.priceRange!;
                const leftPercent = totalRange > 0 ? ((min - overallMin) / totalRange) * 100 : 0;
                const widthPercent = totalRange > 0 ? ((max - min) / totalRange) * 100 : 100;
                const isMain = competitor.name === mainCompetitor.name;

                const barBg = isMain ? 'bg-sky-500' : 'bg-slate-300 dark:bg-gray-600';
                const textLabel = isMain ? 'text-sky-800 dark:text-sky-300' : 'text-slate-800 dark:text-slate-200';

                return (
                    <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                            <p className={`font-semibold text-sm ${textLabel}`}>{competitor.name} {isMain && '(Anda)'}</p>
                            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">{formatCurrency(min)} - {formatCurrency(max)}</p>
                        </div>
                        <div className="w-full h-6 bg-slate-100 rounded-full dark:bg-gray-700" title={`Rentang harga ${competitor.name}: ${formatCurrency(min)} - ${formatCurrency(max)}`}>
                            <div
                                className={`h-full rounded-full transition-all duration-700 ease-in-out ${barBg}`}
                                style={{
                                    marginLeft: `${leftPercent}%`,
                                    width: `${widthPercent}%`,
                                    minWidth: '4px'
                                }}
                            ></div>
                        </div>
                    </div>
                );
            })}
            <div className="flex justify-between text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
                <span>{formatCurrency(overallMin)}</span>
                <span>{formatCurrency(overallMax)}</span>
            </div>
        </div>
    );
};


interface SentimentChartProps {
    praiseCount: number;
    complaintCount: number;
}

export const SentimentChart: React.FC<SentimentChartProps> = ({ praiseCount, complaintCount }) => {
    const [isAnimated, setIsAnimated] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => setIsAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const total = praiseCount + complaintCount;
    if (total === 0) return <div className="text-center text-slate-500 dark:text-slate-400">No sentiment data available.</div>;

    const praisePercent = (praiseCount / total) * 100;
    const complaintPercent = 100 - praisePercent;
    
    const size = 120;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const praiseOffset = (circumference * (100 - praisePercent)) / 100;
    const initialOffset = circumference;

    return (
        <div className="flex w-full flex-col items-center justify-center space-y-2">
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 group">
                <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Sentiment: ${praisePercent.toFixed(0)}% positive, ${complaintPercent.toFixed(0)}% negative.`}>
                    {/* Complaint segment */}
                    <g className="origin-center transform-gpu transition-transform duration-200 group-hover:scale-105">
                        <circle
                            className="text-rose-200 dark:text-rose-900/50"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            r={radius}
                            cx={size / 2}
                            cy={size / 2}
                        />
                        <title>Keluhan: {complaintCount} ({complaintPercent.toFixed(0)}%)</title>
                    </g>
                    {/* Praise segment */}
                    <g className="origin-center transform-gpu transition-transform duration-200 group-hover:scale-105">
                        <circle
                            className="text-sky-500"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            fill="transparent"
                            r={radius}
                            cx={size / 2}
                            cy={size / 2}
                            style={{ 
                                strokeDasharray: `${circumference} ${circumference}`, 
                                strokeDashoffset: isAnimated ? praiseOffset : initialOffset,
                                transform: 'rotate(-90deg)', 
                                transformOrigin: 'center',
                                transition: 'stroke-dashoffset 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                            }}
                        />
                         <title>Pujian: {praiseCount} ({praisePercent.toFixed(0)}%)</title>
                    </g>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl">{praisePercent.toFixed(0)}%</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">Positif</span>
                </div>
            </div>
            <div className="flex w-full max-w-[128px] justify-between text-xs">
                <span className="font-semibold text-sky-600 dark:text-sky-400">Pujian ({praiseCount})</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">Keluhan ({complaintCount})</span>
            </div>
        </div>
    );
}

interface SentimentBarChartProps {
    praise: string[];
    complaints: string[];
    onItemClick: (text: string, type: 'praise' | 'complaint') => void;
}

export const SentimentBarChart: React.FC<SentimentBarChartProps> = ({ praise, complaints, onItemClick }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
            <div>
                <h4 className="font-semibold text-sky-700 dark:text-sky-400 mb-3 text-base">Pujian Paling Menonjol</h4>
                <div className="space-y-2">
                    {praise.map((item, index) => (
                        <button 
                            key={`praise-${index}`} 
                            onClick={() => onItemClick(item, 'praise')}
                            className="relative text-left w-full bg-sky-100 dark:bg-sky-900/50 rounded-md p-2 pl-4 overflow-hidden transition-all duration-200 hover:shadow-md hover:bg-sky-200 dark:hover:bg-sky-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
                        >
                             <div className="absolute left-0 top-0 h-full w-1.5 bg-sky-400"></div>
                             <p className="text-sm text-sky-800 dark:text-sky-200 truncate">{item}</p>
                        </button>
                    ))}
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-rose-700 dark:text-rose-400 mb-3 text-base">Masalah Paling Menonjol</h4>
                <div className="space-y-2">
                    {complaints.map((item, index) => (
                       <button 
                            key={`complaint-${index}`} 
                            onClick={() => onItemClick(item, 'complaint')}
                            className="relative text-left w-full bg-rose-50 dark:bg-rose-900/30 rounded-md p-2 pl-4 overflow-hidden transition-all duration-200 hover:shadow-md hover:bg-rose-100 dark:hover:bg-rose-900/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
                       >
                             <div className="absolute left-0 top-0 h-full w-1.5 bg-rose-400"></div>
                             <p className="text-sm text-rose-800 dark:text-rose-200 truncate">{item}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface TrendChartProps {
    data: { timestamp: number; value: number }[];
    label: string;
    color: string;
    formatValue: (value: number) => string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, label, color, formatValue }) => {
    const { theme } = useTheme();
    const [tooltip, setTooltip] = useState<{ x: number; y: number; value: string; date: string } | null>(null);
    
    const width = 300;
    const height = 150;
    const padding = { top: 20, right: 10, bottom: 30, left: 10 };

    const minX = Math.min(...data.map(d => d.timestamp));
    const maxX = Math.max(...data.map(d => d.timestamp));
    const minY = Math.min(...data.map(d => d.value));
    const maxY = Math.max(...data.map(d => d.value));

    const getX = (timestamp: number) => {
        if (maxX === minX) return padding.left;
        return padding.left + ((timestamp - minX) / (maxX - minX)) * (width - padding.left - padding.right);
    };

    const getY = (value: number) => {
        if (maxY === minY) return height - padding.bottom;
        return height - padding.bottom - ((value - minY) / (maxY - minY)) * (height - padding.top - padding.bottom);
    };

    const linePath = data.map(d => `${getX(d.timestamp)},${getY(d.value)}`).join(' L ');
    const areaPath = `M ${getX(data[0].timestamp)},${height - padding.bottom} L ${linePath} L ${getX(data[data.length - 1].timestamp)},${height - padding.bottom} Z`;

    const handleMouseOver = (point: { timestamp: number; value: number }) => {
        setTooltip({
            x: getX(point.timestamp),
            y: getY(point.value),
            value: formatValue(point.value),
            date: new Date(point.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        });
    };

    const handleMouseOut = () => {
        setTooltip(null);
    };

    return (
        <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{label}</h4>
            <div className="relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="figure" aria-label={`Chart showing trend for ${label}`}>
                    <text x={padding.left} y={height - 5} fontSize="10" className="fill-slate-500 dark:fill-slate-400">
                        {new Date(minX).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                    </text>
                    <text x={width - padding.right} y={height - 5} textAnchor="end" fontSize="10" className="fill-slate-500 dark:fill-slate-400">
                        {new Date(maxX).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                    </text>

                    {/* Area Gradient */}
                    <defs>
                        <linearGradient id={`areaGradient-${label}`} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <path d={areaPath} fill={`url(#areaGradient-${label})`} />
                    
                    {/* Line */}
                    <path d={`M ${linePath}`} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Data Points */}
                    {data.map((point, i) => (
                        <circle
                            key={i}
                            cx={getX(point.timestamp)}
                            cy={getY(point.value)}
                            r="6"
                            fill="transparent"
                            onMouseOver={() => handleMouseOver(point)}
                            onMouseOut={handleMouseOut}
                            className="cursor-pointer"
                        />
                    ))}
                    
                    {/* Tooltip */}
                    {tooltip && (
                        <g transform={`translate(${tooltip.x}, ${tooltip.y})`} className="pointer-events-none">
                            <circle r="4" fill={color} className="stroke-white dark:stroke-gray-800" strokeWidth="2" />
                            <foreignObject x={-50} y={-45} width="100" height="35">
                                 <div xmlns="http://www.w3.org/1999/xhtml" className="p-1.5 text-center text-xs text-white bg-slate-800/90 dark:bg-slate-200/90 dark:text-slate-800 rounded-md shadow-lg">
                                    <div className="font-bold">{tooltip.value}</div>
                                    <div className="opacity-80">{tooltip.date}</div>
                                </div>
                            </foreignObject>
                        </g>
                    )}
                </svg>
            </div>
        </div>
    );
};


// For SalesCopyGenerator
interface RiskGaugeProps {
    level: 'Low' | 'Medium' | 'High';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ level }) => {
    const levelMap = {
        Low: { angle: -60, color: 'text-sky-600 dark:text-sky-400', label: 'Rendah', description: 'Reaksi pasar cenderung positif dengan sedikit potensi kesalahpahaman.' },
        Medium: { angle: 0, color: 'text-amber-500 dark:text-amber-400', label: 'Menengah', description: 'Memerlukan kehati-hatian dalam penyampaian untuk menghindari reaksi beragam.' },
        High: { angle: 60, color: 'text-rose-600 dark:text-rose-400', label: 'Tinggi', description: 'Potensi signifikan untuk reaksi negatif atau kontroversi. Perlu mitigasi kuat.' },
    };
    
    const { angle, color, label, description } = levelMap[level];

    return (
        <div className="w-full max-w-xs mx-auto mt-4" aria-label={`Estimated risk level: ${label}`}>
            <div className="relative">
                <svg viewBox="0 0 100 57" className="w-full">
                    <path d="M 5 50 A 45 45 0 0 1 95 50" className="stroke-slate-200 dark:stroke-gray-700" strokeWidth="10" fill="none" strokeLinecap="round" />
                    <path d="M 5 50 A 45 45 0 0 1 95 50" stroke="url(#gradient)" strokeWidth="10" fill="none" strokeLinecap="round" />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#5890AD" />
                            <stop offset="50%" stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#E11D48" />
                        </linearGradient>
                    </defs>
                    {/* Needle */}
                    <g transform={`translate(50, 50) rotate(${angle})`} className="transition-transform duration-700 ease-in-out">
                         <path d="M 0 -35 L 5 0 L -5 0 Z" className="fill-slate-800 dark:fill-slate-200" />
                         <circle cx="0" cy="0" r="4" className="fill-slate-800 dark:fill-slate-200" />
                    </g>
                </svg>
            </div>
            <div className="text-center -mt-2">
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                    Estimasi Risiko: <span className={`${color}`}>{label}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-2">
                    {description}
                </p>
            </div>
        </div>
    );
};