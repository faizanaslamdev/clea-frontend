'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  shopQuickSuggestionHref,
  shopQuickSuggestionsFor,
} from '@/lib/shop/shop-quick-suggestions';
import type { SuitableFor } from '@/lib/api/chat-types';

interface ShopCategoryTabsProps {
  /** Current Dame/Herre toggle — picks the audience-specific suggestion list. */
  suitableFor: SuitableFor;
  /**
   * Prefetch-then-navigate handler. When provided, pills blur the hub until
   * the destination catalog page is ready instead of doing a cold Link jump.
   */
  onNavigate?: (href: string) => void;
  /** Disable pills while a ready-navigation is in flight. */
  disabled?: boolean;
  className?: string;
}

/** How far one arrow click scrolls the chip row. */
const SCROLL_STEP_PX = 240;
/** Scroll-edge slack before we call the row "at the start/end". */
const SCROLL_EDGE_SLACK_PX = 4;

/**
 * Horizontally-scrollable quick-suggestion row for the /shop hub.
 *
 * These are narrow discovery shortcuts (sub-shelves / destinations the cards
 * do not surface) — not a second copy of the category card list.
 */
export function ShopCategoryTabs({
  suitableFor,
  onNavigate,
  disabled = false,
  className,
}: ShopCategoryTabsProps) {
  const suggestions = shopQuickSuggestionsFor(suitableFor);
  const trackRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > SCROLL_EDGE_SLACK_PX);
    setCanScrollRight(
      el.scrollLeft + el.clientWidth < el.scrollWidth - SCROLL_EDGE_SLACK_PX,
    );
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    updateScrollState();

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [suitableFor, updateScrollState]);

  const scrollByStep = (delta: number) => {
    trackRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div className="shop-category-tabs-wrap">
      <ul
        ref={trackRef}
        className={cn('shop-category-tabs', className)}
        aria-label="Hurtigvalg"
      >
        {suggestions.map((suggestion) => {
          const href = shopQuickSuggestionHref(suggestion, suitableFor);

          return (
            <li key={suggestion.id}>
              <button
                type="button"
                className="shop-category-tabs__chip"
                disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  if (onNavigate) {
                    onNavigate(href);
                    return;
                  }
                  window.location.assign(href);
                }}
              >
                {suggestion.label}
              </button>
            </li>
          );
        })}
      </ul>

      <div
        className={cn(
          'shop-category-tabs__fade shop-category-tabs__fade--left',
          canScrollLeft && 'shop-category-tabs__fade--visible',
        )}
        aria-hidden
      />
      <div
        className={cn(
          'shop-category-tabs__fade shop-category-tabs__fade--right',
          canScrollRight && 'shop-category-tabs__fade--visible',
        )}
        aria-hidden
      />

      <button
        type="button"
        className={cn(
          'shop-category-tabs__scroll-btn shop-category-tabs__scroll-btn--left',
          canScrollLeft && 'shop-category-tabs__scroll-btn--visible',
        )}
        onClick={() => scrollByStep(-SCROLL_STEP_PX)}
        aria-label="Vis hurtigvalg til venstre"
        tabIndex={canScrollLeft ? 0 : -1}
      >
        <ChevronLeft className="size-4" strokeWidth={2.25} aria-hidden />
      </button>
      <button
        type="button"
        className={cn(
          'shop-category-tabs__scroll-btn shop-category-tabs__scroll-btn--right',
          canScrollRight && 'shop-category-tabs__scroll-btn--visible',
        )}
        onClick={() => scrollByStep(SCROLL_STEP_PX)}
        aria-label="Vis hurtigvalg til høyre"
        tabIndex={canScrollRight ? 0 : -1}
      >
        <ChevronRight className="size-4" strokeWidth={2.25} aria-hidden />
      </button>
    </div>
  );
}
