'use client';

import { cn } from '@/lib/utils';

interface SearchSuggestionChipsProps {
  onSelect: (query: string) => void;
  suggestions?: readonly string[];
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchSuggestionChips({
  onSelect,
  suggestions = [],
  ariaLabel = 'Forslag',
  disabled = false,
  className,
}: SearchSuggestionChipsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <ul
      className={cn('search-suggestion-chips', className)}
      aria-label={ariaLabel}
    >
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
