import React from 'react';

interface AnalysisCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ title, icon, children, className = "" }) => {
    return (
        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden animate-pop-in ${className}`} style={{ animationFillMode: 'backwards' }}>
            <div className="p-5 sm:p-6 border-t-4 border-sky-500">
                <div className="flex items-center text-lg font-semibold text-slate-800 mb-4">
                    <span className="text-2xl mr-3">{icon}</span>
                    <h3 className="tracking-tight">{title}</h3>
                </div>
                <div className="text-slate-600 space-y-3">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AnalysisCard;