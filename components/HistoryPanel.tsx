const ANIMATION_DURATION_NORMAL = "0.3s";

import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { useHistory } from '../hooks/useHistory';
import { NicheIcon, CompetitorIcon, CopyIcon, HistoryIcon, TrashIcon, DiscoveryIcon } from './Icons';


const getIconForType = (type: HistoryItem['type']) => {
    switch(type) {
        case 'niche': return <NicheIcon className="w-4 h-4 text-brand dark:text-brand-light" />;
        case 'competitor': return <CompetitorIcon className="w-4 h-4 text-brand dark:text-brand-light" />;
        case 'copy': return <CopyIcon className="w-4 h-4 text-brand dark:text-brand-light" />;
        case 'discovery': return <DiscoveryIcon className="w-4 h-4 text-brand dark:text-brand-light" />;
        default: return null;
    }
}

const HistoryItemCard: React.FC<{ item: HistoryItem; onLoad: (item: HistoryItem) => void; style?: React.CSSProperties }> = ({ item, onLoad, style }) => {
    const { query, timestamp, type } = item;

    return (
        <button 
            onClick={() => onLoad(item)}
            className="w-full text-left p-3 rounded-lg bg-surface-light hover:bg-brand/10 border border-border-light transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:bg-surface-dark/50 dark:hover:bg-brand/20 dark:border-border-dark"
            style={style}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex-shrink-0">{getIconForType(type)}</div>
                    <p className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate text-sm" title={query}>
                        {query}
                    </p>
                </div>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark flex-shrink-0 ml-2">{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        </button>
    );
};


interface HistoryPanelProps {
    onLoadFromHistory: (item: HistoryItem) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ onLoadFromHistory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { history, clearHistory } = useHistory();

    const handleLoad = (item: HistoryItem) => {
        onLoadFromHistory(item);
        setIsOpen(false);
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-24 sm:bottom-6 right-6 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-brand text-white shadow-lg hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand dark:focus:ring-offset-gray-900 flex items-center justify-center transition-transform transform hover:scale-110"
                aria-label="Toggle analysis history"
            >
                <HistoryIcon className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>

            {isOpen && <div className="fixed inset-0 bg-black/30 z-40 animate-fade-in" style={{ animationDuration: ANIMATION_DURATION_NORMAL }} onClick={() => setIsOpen(false)}></div>}

            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-surface-light shadow-2xl z-50 transform transition-transform duration-300 dark:bg-surface-dark ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="history-panel-title"
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-border-light bg-surface-light dark:border-border-dark dark:bg-background-dark">
                        <h2 id="history-panel-title" className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
                            <HistoryIcon className="w-6 h-6 text-brand-text dark:text-brand-light" />
                            Analysis History
                        </h2>
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-2xl leading-none hover:bg-surface-light text-text-secondary-light dark:hover:bg-surface-dark dark:text-text-secondary-dark" aria-label="Close history panel"><span aria-hidden="true">&times;</span></button>
                    </div>

                    <div className="flex-grow p-4 overflow-y-auto">
                        {history.length > 0 ? (
                            <div className="space-y-3 stagger-in">
                                {history.map((item, index) => (
                                    <HistoryItemCard key={item.id} item={item} onLoad={handleLoad} style={{ animationDelay: `${index * 50}ms` }} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 h-full flex flex-col justify-center items-center">
                                <HistoryIcon className="w-12 h-12 mx-auto text-border-light dark:text-border-dark" />
                                <h3 className="mt-2 text-sm font-medium text-text-primary-light dark:text-text-primary-dark">No History Yet</h3>
                                <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">Your recent analyses will appear here.</p>
                            </div>
                        )}
                    </div>
                    
                    {history.length > 0 && (
                        <div className="p-4 border-t border-border-light bg-surface-light dark:border-border-dark dark:bg-background-dark">
                            <button
                                onClick={clearHistory}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-error-light dark:text-error-dark bg-error-light dark:bg-error-dark rounded-md hover:bg-error-light dark:hover:bg-error-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-light dark:focus:ring-accent-dark   "
                            >
                                <TrashIcon className="w-4 h-4" />
                                Clear History
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default HistoryPanel;