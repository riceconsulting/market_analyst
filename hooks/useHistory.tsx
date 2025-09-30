import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { HistoryItem } from '../types';

interface HistoryContextProps {
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextProps | undefined>(undefined);

const HISTORY_STORAGE_KEY = 'rice-ai-market-analyst-history';
const MAX_HISTORY_ITEMS = 20;

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      if (typeof window === 'undefined') {
          return [];
      }
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
      console.error('Failed to load history from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history to localStorage', error);
    }
  }, [history]);

  const addHistoryItem = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setHistory(prevHistory => {
      if (prevHistory.length > 0 && prevHistory[0].query === newItem.query && prevHistory[0].type === newItem.type) {
        return prevHistory;
      }
      const updatedHistory = [newItem, ...prevHistory];
      return updatedHistory.slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <HistoryContext.Provider value={{ history, addHistoryItem, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
