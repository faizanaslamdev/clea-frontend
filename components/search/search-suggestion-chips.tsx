'use client';

import { SEARCH_SUGGESTION_CHIPS } from '@/lib/constants/search-prompts';

interface SearchSuggestionChipsProps {
  onSelect: (query: string) => void;
  suggestions?: readonly string[];
  ariaLabel?: string;
}

export function SearchSuggestionChips({
  onSelect,
  suggestions = SEARCH_SUGGESTION_CHIPS,
  ariaLabel = 'Example searches',
}: SearchSuggestionChipsProps) {
  return (
    <ul className="search-suggestion-chips" aria-label={ariaLabel}>
      {suggestions.map((label) => (
        <li key={label}>
          <button
            type="button"
            className="search-suggestion-chips__chip"
            onClick={() => onSelect(label)}
          >
            {label}
          </button>
        </li>
      ))}
    </ul>
  );
}
