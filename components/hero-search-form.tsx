'use client';

import { useCallback, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type ShopCategory = 'womens' | 'mens';

export type HeroSearchVariant = 'full' | 'compact';
export type HeroSearchSize = 'default' | 'large';

interface HeroSearchFormProps {
  variant?: HeroSearchVariant;
  size?: HeroSearchSize;
  className?: string;
  idPrefix?: string;
  inert?: boolean;
  'aria-hidden'?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  onSubmitQuery?: (query: string) => void;
  placeholder?: string;
  inputLabel?: string;
}

export function HeroSearchForm({
  variant = 'full',
  size = 'default',
  className,
  idPrefix = 'hero-search',
  inert,
  'aria-hidden': ariaHidden,
  value: controlledValue,
  onValueChange,
  onSubmitQuery,
  placeholder = 'Beskriv hva du leter etter …',
  inputLabel = 'Beskriv hva du leter etter',
}: HeroSearchFormProps) {
  const [category, setCategory] = useState<ShopCategory>('mens');
  const [internalQuery, setInternalQuery] = useState('');
  const router = useRouter();

  const isControlled = controlledValue !== undefined;
  const query = isControlled ? controlledValue : internalQuery;
  const setQuery = (next: string) => {
    if (!isControlled) setInternalQuery(next);
    onValueChange?.(next);
  };

  const inputId = `${idPrefix}-query`;
  const hasText = query.trim().length > 0;

  const navigateToChat = useCallback(
    (trimmed: string) => {
      const params = new URLSearchParams();
      if (trimmed) params.set('q', trimmed);
      if (variant === 'full') params.set('category', category);
      router.push(`/chat?${params.toString()}`);
    },
    [router, variant, category],
  );

  const submitQuery = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (onSubmitQuery) {
      onSubmitQuery(trimmed);
      return;
    }

    navigateToChat(trimmed);
  }, [query, onSubmitQuery, navigateToChat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuery();
  };

  const handleQueryKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    submitQuery();
  };

  if (variant === 'compact') {
    return (
      <form
        onSubmit={handleSubmit}
        inert={inert}
        aria-hidden={ariaHidden}
        className={cn(
          'hero-search-bar hero-search-bar--compact',
          size === 'large' && 'hero-search-bar--large',
          className,
        )}
      >
        <label htmlFor={inputId} className="sr-only">
          {inputLabel}
        </label>
        <textarea
          id={inputId}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleQueryKeyDown}
          placeholder={placeholder}
          rows={1}
          className="hero-search-bar--compact__input"
          autoComplete="off"
          enterKeyHint="search"
        />
        <button
          type="submit"
          className={cn(
            'hero-search-bar--compact__submit',
            hasText && 'hero-search-bar--compact__submit--active',
          )}
          disabled={!hasText}
          aria-label="Søk"
        >
          <ArrowUp className="size-4.5" strokeWidth={2.25} />
        </button>
      </form>
    );
  }

  return (
    <div className={cn('hero-search-stack layout-inner-medium', className)}>
      <div
        className="hero-category-toggle"
        role="tablist"
        aria-label="Handlekategori"
      >
        {(['womens', 'mens'] as const).map((value) => {
          const label = value === 'womens' ? 'Dame' : 'Herre';
          const isActive = category === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setCategory(value)}
              className={cn(
                'hero-category-toggle__btn',
                isActive && 'hero-category-toggle__btn--active',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="hero-search-card">
        <label htmlFor={inputId} className="sr-only">
          {inputLabel}
        </label>
        <textarea
          id={inputId}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleQueryKeyDown}
          placeholder={placeholder}
          rows={1}
          className="hero-search-card__input"
          enterKeyHint="search"
        />

        <div className="hero-search-card__footer">
          <button
            type="submit"
            className={cn(
              'hero-search-card__submit',
              hasText && 'hero-search-card__submit--active',
            )}
            disabled={!hasText}
            aria-label="Søk"
          >
            <ArrowUp className="size-4.5" strokeWidth={2.25} />
          </button>
        </div>
      </form>
    </div>
  );
}
