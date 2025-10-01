import React from 'react';

interface PromptSuggestionsProps {
  title?: string;
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({
  title = "Atau coba contoh ini:",
  suggestions,
  onSelectSuggestion,
}) => {
  return (
    <div className="mt-6 animate-fade-in">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">{title}</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.slice(0, 5).map((suggestion, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelectSuggestion(suggestion)}
            className="px-3 py-1.5 text-sm text-brand-text bg-brand/10 rounded-full hover:bg-brand/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand dark:text-brand-light dark:bg-brand/20 dark:hover:bg-brand/30"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromptSuggestions;