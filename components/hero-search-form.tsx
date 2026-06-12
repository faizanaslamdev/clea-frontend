'use client';

import { useCallback, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp } from 'lucide-react';
import type { ShopCategory } from '@/lib/api/chat-types';
import { cn } from '@/lib/utils';

export type HeroSearchVariant = 'full' | 'compact';
export type HeroSearchSize = 'default' | 'large';
export type HeroSearchAppearance = 'default' | 'floating';

interface HeroSearchFormProps {
  variant?: HeroSearchVariant;
  size?: HeroSearchSize;
  appearance?: HeroSearchAppearance;
  className?: string;
  idPrefix?: string;
  inert?: boolean;
  'aria-hidden'?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  onSubmitQuery?: (query: string) => void;
  submitLocked?: boolean;
  placeholder?: string;
  shopCategory?: ShopCategory;
  onShopCategoryChange?: (category: ShopCategory) => void;
}

export function HeroSearchForm({
  variant = 'full',
  size = 'default',
  appearance = 'default',
  className,
  idPrefix = 'hero-search',
  inert,
  'aria-hidden': ariaHidden,
  value: controlledValue,
  onValueChange,
  onSubmitQuery,
  submitLocked = false,
  placeholder = 'Beskriv hva du leter etter …',
  shopCategory: controlledShopCategory,
  onShopCategoryChange,
}: HeroSearchFormProps) {
  const [internalShopCategory, setInternalShopCategory] =
    useState<ShopCategory>('mens');
  const isShopCategoryControlled = controlledShopCategory !== undefined;
  const shopCategory = isShopCategoryControlled
    ? controlledShopCategory
    : internalShopCategory;
  const setShopCategory = (next: ShopCategory) => {
    if (!isShopCategoryControlled) {
      setInternalShopCategory(next);
    }
    onShopCategoryChange?.(next);
  };
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
  const glassClass = appearance === 'floating' ? 'hero-search-glass' : undefined;

  const navigateToChat = useCallback(
    (trimmed: string) => {
      const params = new URLSearchParams();
      if (trimmed) params.set('q', trimmed);
      if (variant === 'full') params.set('category', shopCategory);
      router.push(`/chat?${params.toString()}`);
    },
    [router, variant, shopCategory],
  );

  const submitQuery = useCallback(() => {
    if (submitLocked) return;

    const trimmed = query.trim();
    if (!trimmed) return;

    if (onSubmitQuery) {
      onSubmitQuery(trimmed);
      return;
    }

    navigateToChat(trimmed);
  }, [query, onSubmitQuery, navigateToChat, submitLocked]);

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
          glassClass,
          className,
        )}
        aria-busy={submitLocked}
      >
        <label htmlFor={inputId} className="sr-only">
          Beskriv hva du leter etter
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
          className="hero-search-bar--compact__submit hero-search-bar--compact__submit--active"
          aria-label="Søk"
        >
          <ArrowUp className="size-[1.125rem]" strokeWidth={2.25} />
        </button>
      </form>
    );
  }

  return (
    <div className={cn('hero-search-stack layout-inner-medium', className)}>
      <div
        className={cn('hero-category-toggle', glassClass)}
        role="tablist"
        aria-label="Handlekategori"
      >
        {(['womens', 'mens'] as const).map((value) => {
          const label = value === 'womens' ? 'Dame' : 'Herre';
          const isActive = shopCategory === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setShopCategory(value)}
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

      <form
        onSubmit={handleSubmit}
        className={cn(
          'hero-search-card',
          glassClass,
          submitLocked && 'hero-search-card--locked',
        )}
        aria-busy={submitLocked}
      >
        <label htmlFor={inputId} className="sr-only">
          Beskriv hva du leter etter
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
          disabled={submitLocked}
          readOnly={submitLocked}
        />

        <div className="hero-search-card__footer">
          <button
            type="submit"
            className="hero-search-card__submit hero-search-card__submit--active"
            aria-label="Søk"
          >
            <ArrowUp className="size-[1.125rem]" strokeWidth={2.25} />
          </button>
        </div>
      </form>
    </div>
  );
}
