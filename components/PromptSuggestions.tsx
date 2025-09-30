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
      <p className="text-sm font-medium text-slate-600 mb-3">{title}</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.slice(0, 5).map((suggestion, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelectSuggestion(suggestion)}
            className="px-3 py-1.5 text-sm text-sky-700 bg-sky-50 rounded-full hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromptSuggestions;