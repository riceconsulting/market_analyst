import React from 'react';

interface AnalysisCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    animationDelay?: string;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ title, icon, children, className = "", animationDelay = '0ms' }) => {
    return (
        <div 
            className={`bg-white rounded-xl border border-slate-200/80 shadow-lg mb-6 overflow-hidden animate-slide-fade-in dark:bg-slate-800 dark:border-slate-700/80 ${className}`} 
            style={{ animationDelay, animationFillMode: 'backwards' }}
        >
            <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-100">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 mr-3 flex-shrink-0">
                        {icon}
                    </span>
                    <h3 className="tracking-tight">{title}</h3>
                </div>
            </div>
            <div className="p-5 sm:p-6">
                <div className="text-slate-600 dark:text-slate-300 space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AnalysisCard;