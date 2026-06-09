'use client';

import { SEARCH_SUGGESTION_CHIPS } from '@/lib/constants/search-prompts';

interface SearchSuggestionChipsProps {
  onSelect: (query: string) => void;
  suggestions?: readonly string[];
  ariaLabel?: string;
  disabled?: boolean;
}

export function SearchSuggestionChips({
  onSelect,
  suggestions = SEARCH_SUGGESTION_CHIPS,
  ariaLabel = 'Example searches',
  disabled = false,
}: SearchSuggestionChipsProps) {
  return (
    <ul className="search-suggestion-chips" aria-label={ariaLabel}>
      {suggestions.map((label) => (
        <li key={label}>
          <button
            type="button"
            className="search-suggestion-chips__chip"
            disabled={disabled}
            onClick={() => onSelect(label)}
          >
            {label}
          </button>
        </li>
      ))}
    </ul>
  );
}
