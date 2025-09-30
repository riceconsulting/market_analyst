import React from 'react';

// For NicheTrendAnalysis
interface LifecycleGraphProps {
    activePhase: 'Baru' | 'Berkembang' | 'Matang' | 'Menurun';
}

export const LifecycleGraph: React.FC<LifecycleGraphProps> = ({ activePhase }) => {
    const phases = ['Baru', 'Berkembang', 'Matang', 'Menurun'];
    const phaseConfig = {
        'Baru': { cx: '15%', color: '#5890AD' },
        'Berkembang': { cx: '40%', color: '#5890AD' },
        'Matang': { cx: '65%', color: '#5890AD' },
        'Menurun': { cx: '90%', color: '#5890AD' },
    };
    const { cx, color } = phaseConfig[activePhase];

    return (
        <div className="mt-3">
             <div className="w-full" aria-label={`Trend lifecycle phase: ${activePhase}`}>
                <svg viewBox="0 0 300 60" className="w-full h-auto">
                    {/* S-Curve Path */}
                    <path d="M 10 50 Q 75 50, 100 30 T 190 20 Q 250 10, 290 10" stroke="#CBD5E1" strokeWidth="2" fill="none" />
                    
                    {/* Phase labels */}
                    {Object.entries(phaseConfig).map(([phase, config]) => (
                        <text key={phase} x={config.cx} y="55" textAnchor="middle" fontSize="10" fill={phase === activePhase ? '#5890AD' : '#64748B'} fontWeight={phase === activePhase ? '600' : '400'}>
                            {phase}
                        </text>
                    ))}

                    {/* Active Phase Indicator */}
                    <g style={{ transform: `translateX(calc(${cx} - 50%))`, transition: 'transform 0.5s ease-in-out' }}>
                         <circle cx="50%" cy={activePhase === 'Baru' ? 42 : activePhase === 'Berkembang' ? 32 : activePhase === 'Matang' ? 20 : 12} r="5" fill={color} stroke="white" strokeWidth="2">
                             <animate attributeName="r" values="5;7;5" dur="1.5s" repeatCount="indefinite" />
                         </circle>
                    </g>
                </svg>
            </div>
        </div>
    );
};


// For CompetitorAnalysis
interface SentimentChartProps {
    praiseCount: number;
    complaintCount: number;
}

export const SentimentChart: React.FC<SentimentChartProps> = ({ praiseCount, complaintCount }) => {
    const total = praiseCount + complaintCount;
    if (total === 0) return <div className="text-center text-slate-500">No sentiment data available.</div>;

    const praisePercent = (praiseCount / total) * 100;
    
    const size = 120;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const praiseOffset = (circumference * (100 - praisePercent)) / 100;


    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center space-y-2">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Sentiment: ${praisePercent.toFixed(0)}% positive, ${(100-praisePercent).toFixed(0)}% negative.`}>
                <circle
                    className="text-rose-200"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className="text-sky-500 transition-all duration-1000 ease-out"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{ strokeDasharray: `${circumference} ${circumference}`, strokeDashoffset: praiseOffset, transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
            </svg>
             <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-800">{praisePercent.toFixed(0)}%</span>
                <span className="text-sm text-slate-500">Positif</span>
            </div>
             <div className="flex justify-between w-full text-xs pt-2">
                <span className="font-semibold text-sky-600">Pujian ({praiseCount})</span>
                <span className="font-semibold text-rose-600">Keluhan ({complaintCount})</span>
            </div>
        </div>
    );
}

// For SalesCopyGenerator
interface RiskGaugeProps {
    level: 'Low' | 'Medium' | 'High';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ level }) => {
    const levelMap = {
        Low: { angle: -60, color: 'text-sky-600', label: 'Rendah' },
        Medium: { angle: 0, color: 'text-amber-500', label: 'Menengah' },
        High: { angle: 60, color: 'text-rose-600', label: 'Tinggi' },
    };
    
    const { angle, color, label } = levelMap[level];

    return (
        <div className="w-full max-w-xs mx-auto mt-4" aria-label={`Estimated risk level: ${label}`}>
            <div className="relative">
                <svg viewBox="0 0 100 57" className="w-full">
                    <path d="M 5 50 A 45 45 0 0 1 95 50" stroke="#E2E8F0" strokeWidth="10" fill="none" strokeLinecap="round" />
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
                         <path d="M 0 -35 L 5 0 L -5 0 Z" fill="#1E293B" />
                         <circle cx="0" cy="0" r="4" fill="#1E293B" />
                    </g>
                </svg>
                 <p className="text-center font-semibold text-sm -mt-4 text-slate-800">
                    Estimasi Risiko: <span className={`${color}`}>{label}</span>
                </p>
            </div>
        </div>
    );
};