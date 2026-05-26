'use client';

import { SEARCH_SUGGESTION_CHIPS } from '@/lib/constants/search-prompts';

interface SearchSuggestionChipsProps {
  onSelect: (query: string) => void;
}

export function SearchSuggestionChips({ onSelect }: SearchSuggestionChipsProps) {
  return (
    <ul className="search-suggestion-chips" aria-label="Example searches">
      {SEARCH_SUGGESTION_CHIPS.map((label) => (
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
