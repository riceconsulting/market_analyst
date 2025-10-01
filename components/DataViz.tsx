


import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

// A custom hook to get real-time dimensions of a DOM element using ResizeObserver
const useDimensions = (targetRef: React.RefObject<Element>) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if (entries && entries.length > 0) {
                const { width, height } = entries[0].contentRect;
                setDimensions({ width, height });
            }
        });

        const element = targetRef.current;
        if (element) {
            observer.observe(element);
        }

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [targetRef]);

    return dimensions;
};


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
    const containerRef = useRef<HTMLDivElement>(null);
    const { width } = useDimensions(containerRef);
    const [tooltip, setTooltip] = useState<{ content: string; x: number, y: number } | null>(null);

    const phaseConfig = {
        'Baru': { cxPercentage: 15, color: '#5890AD', pathY: (h:number) => h * 0.8 },
        'Berkembang': { cxPercentage: 40, color: '#5890AD', pathY: (h:number) => h * 0.5 },
        'Matang': { cxPercentage: 65, color: '#5890AD', pathY: (h:number) => h * 0.3 },
        'Menurun': { cxPercentage: 90, color: '#5890AD', pathY: (h:number) => h * 0.2 },
    };

    const activePhaseConfig = phaseConfig[activePhase];
    const activeTextColor = theme === 'dark' ? '#9BBBCC' : '#5890AD';
    const inactiveTextColor = theme === 'dark' ? '#94a3b8' : '#64748b';

    const handleMouseOver = (phase: keyof typeof phaseDescriptions, event: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setTooltip({
            content: phaseDescriptions[phase],
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        });
    };

    const handleMouseOut = () => {
        setTooltip(null);
    };
    
    const getTooltipStyle = (): React.CSSProperties => {
        if (!tooltip || !width) return { opacity: 0 };

        const tooltipWidth = 150;
        const tooltipHeight = 80; // Estimated height
        
        let left = tooltip.x;
        let top = tooltip.y;
        let transform = 'translate(-50%, -120%)';

        // Prevent horizontal overflow
        if (tooltip.x - tooltipWidth / 2 < 0) {
            left = tooltipWidth / 2 + 5;
        } else if (tooltip.x + tooltipWidth / 2 > width) {
            left = width - tooltipWidth / 2 - 5;
        }

        // Prevent vertical overflow (flip to bottom)
        if (tooltip.y < tooltipHeight) {
            transform = 'translate(-50%, 20%)';
        }

        return {
            position: 'absolute',
            top,
            left,
            transform,
            width: tooltipWidth,
            opacity: 1,
            transition: 'opacity 0.2s',
        };
    };

    return (
        <div ref={containerRef} className="relative mt-3">
            <div className="w-full" aria-label={`Trend lifecycle phase: ${activePhase}`}>
                <svg viewBox="0 0 300 70" className="w-full h-auto" style={{ overflow: 'visible' }}>
                    <g transform="translate(0, 10)">
                        <path d="M 10 50 Q 75 50, 100 30 T 190 20 Q 250 10, 290 10" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="2" fill="none" />
                        <g style={{ transform: `translateX(calc(${activePhaseConfig.cxPercentage}%))`, transition: 'transform 0.5s ease-in-out' }}>
                            <circle cx="0" cy={phaseConfig[activePhase].pathY(50)} r="5" fill={activePhaseConfig.color} className="stroke-white dark:stroke-slate-800" strokeWidth="2">
                                <animate attributeName="r" values="5;7;5" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                        </g>
                    </g>
                    {Object.entries(phaseConfig).map(([phase, config]) => (
                        <g 
                            key={phase} 
                            onMouseOver={(e) => handleMouseOver(phase as keyof typeof phaseDescriptions, e)}
                            onMouseOut={handleMouseOut}
                            style={{ cursor: 'help' }}
                        >
                            <rect x={(config.cxPercentage / 100 * 300) - 20} y="50" width="40" height="20" fill="transparent" />
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
                </svg>
            </div>
            <div 
                className="absolute p-2 text-center text-xs text-white bg-slate-800/90 dark:bg-slate-200/90 dark:text-slate-800 rounded-md shadow-lg pointer-events-none z-10"
                style={getTooltipStyle()}
            >
                {tooltip?.content}
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
    const [isAnimated, setIsAnimated] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);
    
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

                const barBg = isMain ? 'bg-brand' : 'bg-slate-300 dark:bg-gray-600';
                const textLabel = isMain ? 'text-brand-text dark:text-brand-light' : 'text-slate-800 dark:text-slate-200';

                return (
                    <div key={index}>
                        <div className="flex justify-between items-center mb-1 flex-wrap">
                            <p className={`font-semibold text-sm ${textLabel}`}>{competitor.name} {isMain && '(Target)'}</p>
                            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">{formatCurrency(min)} - {formatCurrency(max)}</p>
                        </div>
                        <div className="w-full h-6 bg-slate-100 rounded-full dark:bg-gray-700" title={`Rentang harga ${competitor.name}: ${formatCurrency(min)} - ${formatCurrency(max)}`}>
                            <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${barBg}`}
                                style={{
                                    marginLeft: `${leftPercent}%`,
                                    width: isAnimated ? `${widthPercent}%`: '0%',
                                    minWidth: '4px',
                                    transitionDelay: `${index * 100}ms`
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
                    <g className="origin-center transition-transform duration-200 group-hover:scale-105">
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
                    <g className="origin-center transition-transform duration-200 group-hover:scale-105">
                        <circle
                            className="text-brand"
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
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-transform duration-200 group-hover:scale-105">
                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl">{praisePercent.toFixed(0)}%</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">Positif</span>
                </div>
            </div>
            <div className="flex w-full max-w-[128px] justify-between text-xs">
                <span className="font-semibold text-brand dark:text-brand-light">Pujian ({praiseCount})</span>
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
                <h4 className="font-semibold text-brand-text dark:text-brand-light mb-3 text-base">Pujian Paling Menonjol</h4>
                <div className="space-y-2">
                    {praise.map((item, index) => (
                        <button 
                            key={`praise-${index}`} 
                            onClick={() => onItemClick(item, 'praise')}
                            className="relative text-left w-full bg-brand/10 dark:bg-brand/20 rounded-md p-2 pl-4 overflow-hidden transition-all duration-200 transform hover:shadow-lg hover:bg-brand/20 dark:hover:bg-brand/30 hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
                        >
                             <div className="absolute left-0 top-0 h-full w-1.5 bg-brand/70"></div>
                             <p className="text-sm text-brand-text dark:text-brand-light truncate">{item}</p>
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
                            className="relative text-left w-full bg-rose-50 dark:bg-rose-900/30 rounded-md p-2 pl-4 overflow-hidden transition-all duration-200 transform hover:shadow-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
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
    const containerRef = useRef<HTMLDivElement>(null);
    const { width } = useDimensions(containerRef);
    const height = width > 0 ? width * 0.5 : 150; // Maintain a 2:1 aspect ratio
    const [activePoint, setActivePoint] = useState<typeof data[0] | null>(null);

    const padding = { top: 20, right: 15, bottom: 30, left: 15 };

    const { minX, maxX, minY, maxY, getX, getY } = useMemo(() => {
        if (!data || data.length < 2 || width === 0) {
            return { minX: 0, maxX: 0, minY: 0, maxY: 0, getX: () => 0, getY: () => 0 };
        }
        const minXVal = Math.min(...data.map(d => d.timestamp));
        const maxXVal = Math.max(...data.map(d => d.timestamp));
        const minYVal = Math.min(...data.map(d => d.value));
        const maxYVal = Math.max(...data.map(d => d.value));
        const yRange = maxYVal - minYVal;

        const getXCoord = (timestamp: number) => {
            if (maxXVal === minXVal) return padding.left;
            return padding.left + ((timestamp - minXVal) / (maxXVal - minXVal)) * (width - padding.left - padding.right);
        };

        const getYCoord = (value: number) => {
            if (yRange === 0) return height / 2;
            return height - padding.bottom - ((value - minYVal) / yRange) * (height - padding.top - padding.bottom);
        };

        return { minX: minXVal, maxX: maxXVal, minY: minYVal, maxY: maxYVal, getX: getXCoord, getY: getYCoord };
    }, [data, width, height, padding]);

    const linePath = useMemo(() => data.map(d => `${getX(d.timestamp)},${getY(d.value)}`).join(' L '), [data, getX, getY]);
    const areaPath = useMemo(() => `M ${getX(data[0].timestamp)},${height - padding.bottom} L ${linePath} L ${getX(data[data.length - 1].timestamp)},${height - padding.bottom} Z`, [data, getX, getY, height, padding.bottom, linePath]);

    const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
        const svg = event.currentTarget;
        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        const { x } = point.matrixTransform(svg.getScreenCTM()!.inverse());

        const closestPoint = data.reduce((prev, curr) => 
            Math.abs(getX(curr.timestamp) - x) < Math.abs(getX(prev.timestamp) - x) ? curr : prev
        );
        setActivePoint(closestPoint);
    };

    const handleMouseLeave = () => setActivePoint(null);
    
    if (data.length < 2) return null; // Don't render chart without enough data

    const tooltipX = activePoint ? getX(activePoint.timestamp) : 0;
    const tooltipY = activePoint ? getY(activePoint.value) : 0;
    const tooltipOnLeft = tooltipX > width / 2;

    return (
        <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{label}</h4>
            <div ref={containerRef} className="relative w-full" style={{ height: `${height}px` }}>
                {width > 0 && (
                    <>
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} role="figure" style={{ overflow: 'visible' }}>
                            <text x={padding.left} y={height - 5} fontSize="10" className="fill-slate-500 dark:fill-slate-400">
                                {new Date(minX).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                            </text>
                            <text x={width - padding.right} y={height - 5} textAnchor="end" fontSize="10" className="fill-slate-500 dark:fill-slate-400">
                                {new Date(maxX).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                            </text>
                             <g className="animate-fade-in">
                                <defs>
                                    <linearGradient id={`areaGradient-${label.replace(/\s+/g, '')}`} x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <path d={areaPath} fill={`url(#areaGradient-${label.replace(/\s+/g, '')})`} />
                                <path d={`M ${linePath}`} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                
                                {/* Data points */}
                                {data.map((d, i) => (
                                    <circle
                                        key={`point-${i}`}
                                        cx={getX(d.timestamp)}
                                        cy={getY(d.value)}
                                        r={activePoint?.timestamp === d.timestamp ? 5 : 3.5}
                                        fill={color}
                                        stroke={theme === 'dark' ? '#1e293b' : 'white'}
                                        strokeWidth="2"
                                        className="transition-all duration-200"
                                    />
                                ))}
                            </g>
                        </svg>

                        {activePoint && (
                            <div className="absolute top-0 left-0 pointer-events-none w-full h-full">
                                <div className="absolute bg-slate-300 dark:bg-slate-600" style={{ left: tooltipX, top: padding.top, width: 1, height: height - padding.top - padding.bottom }} />
                                <div 
                                    className="absolute p-1.5 text-center text-xs text-white bg-slate-800/90 dark:bg-slate-200/90 dark:text-slate-800 rounded-md shadow-lg"
                                    style={{
                                        top: tooltipY,
                                        left: tooltipX,
                                        transform: `translate(${tooltipOnLeft ? '-110%' : '10%'}, -50%)`,
                                        transition: 'transform 0.1s ease-out'
                                    }}
                                >
                                    <div className="font-bold">{formatValue(activePoint.value)}</div>
                                    <div className="opacity-80">{new Date(activePoint.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                                </div>
                            </div>
                        )}
                    </>
                )}
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
        Low: { angle: -60, color: 'text-brand dark:text-brand-light', label: 'Rendah', description: 'Reaksi pasar cenderung positif dengan sedikit potensi kesalahpahaman.' },
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