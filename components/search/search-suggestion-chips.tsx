'use client';

interface SearchSuggestionChipsProps {
  onSelect: (query: string) => void;
  suggestions?: readonly string[];
  ariaLabel?: string;
  disabled?: boolean;
}

export function SearchSuggestionChips({
  onSelect,
  suggestions = [],
  ariaLabel = 'Forslag',
  disabled = false,
}: SearchSuggestionChipsProps) {
  if (suggestions.length === 0) {
    return null;
  }

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
