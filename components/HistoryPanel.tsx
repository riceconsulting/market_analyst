import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { useHistory } from '../hooks/useHistory';
import { NicheIcon, CompetitorIcon, CopyIcon, HistoryIcon, TrashIcon } from './Icons';


const getIconForType = (type: HistoryItem['type']) => {
    switch(type) {
        case 'niche': return <NicheIcon className="w-4 h-4 text-sky-600" />;
        case 'competitor': return <CompetitorIcon className="w-4 h-4 text-sky-600" />;
        case 'copy': return <CopyIcon className="w-4 h-4 text-sky-600" />;
        default: return null;
    }
}

const HistoryItemCard: React.FC<{ item: HistoryItem; onLoad: (item: HistoryItem) => void }> = ({ item, onLoad }) => {
    const { query, timestamp, type } = item;

    return (
        <button 
            onClick={() => onLoad(item)}
            className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-sky-50 border border-slate-200 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex-shrink-0">{getIconForType(type)}</div>
                    <p className="font-semibold text-slate-700 truncate text-sm" title={query}>
                        {query}
                    </p>
                </div>
                <p className="text-xs text-slate-400 flex-shrink-0 ml-2">{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
                className="fixed bottom-24 sm:bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-sky-600 text-white shadow-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center justify-center transition-transform transform hover:scale-110"
                aria-label="Toggle analysis history"
            >
                <HistoryIcon className="w-8 h-8" />
            </button>

            {isOpen && <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setIsOpen(false)}></div>}

            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-slate-100 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="history-panel-title"
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
                        <h2 id="history-panel-title" className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <HistoryIcon className="w-6 h-6 text-sky-700" />
                            Analysis History
                        </h2>
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-2xl leading-none hover:bg-slate-100 text-slate-500" aria-label="Close history panel">&times;</button>
                    </div>

                    <div className="flex-grow p-4 overflow-y-auto">
                        {history.length > 0 ? (
                            <div className="space-y-3">
                                {history.map(item => (
                                    <HistoryItemCard key={item.id} item={item} onLoad={handleLoad} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 h-full flex flex-col justify-center items-center">
                                <HistoryIcon className="w-12 h-12 mx-auto text-slate-300" />
                                <h3 className="mt-2 text-sm font-medium text-slate-700">No History Yet</h3>
                                <p className="mt-1 text-sm text-slate-500">Your recent analyses will appear here.</p>
                            </div>
                        )}
                    </div>
                    
                    {history.length > 0 && (
                        <div className="p-4 border-t border-slate-200 bg-white">
                            <button
                                onClick={clearHistory}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
