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
            className={`bg-white rounded-xl border border-border-light dark:border-border-dark/80 shadow-lg mb-6 overflow-hidden animate-slide-fade-in dark:bg-surface-dark dark:border-border-dark/80 ${className}`} 
            style={{ animationDelay, animationFillMode: 'backwards' }}
        >
            <div className="p-4 sm:p-5 bg-surface-light dark:bg-surface-dark/50 dark:bg-surface-dark/20 border-b border-border-light dark:border-border-dark/80 dark:border-border-dark/80">
                <div className="flex items-center text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light mr-3 flex-shrink-0">
                        {icon}
                    </span>
                    <h3 className="tracking-tight">{title}</h3>
                </div>
            </div>
            <div className="p-5 sm:p-6">
                <div className="text-text-primary-light dark:text-text-primary-dark space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AnalysisCard;