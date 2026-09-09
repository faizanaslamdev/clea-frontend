'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navigateToChatEntry } from '@/lib/chat/chat-entry';
import { categoryGridForShop } from '@/lib/constants/category-grid';
import type { ShopCategory, SuitableFor } from '@/lib/api/chat-types';

interface ShopCategoryTabsProps {
  /** Current Dame/Herre toggle — picks the gender-specific chip list and
   * is carried into chat so a chip click keeps the same browsing context. */
  suitableFor: SuitableFor;
  shopCategory?: ShopCategory;
  className?: string;
}

/** How far one arrow click scrolls the chip row. */
const SCROLL_STEP_PX = 240;
/** Scroll-edge slack before we call the row "at the start/end" -- avoids
 * the arrow flickering on a 1px sub-pixel rounding difference. */
const SCROLL_EDGE_SLACK_PX = 4;

/**
 * Horizontally-scrollable category chip row for the /shop page. Each chip
 * is a launcher straight into chat with that category's query (same as
 * the "Top categories" fan cards below it) -- not an in-page filter, since
 * /shop has no product grid of its own to filter. Dame/Herre each get
 * their own equal-length chip list (Daydream Womens/Mens pattern).
 *
 * Scroll arrows -- studied from daydream.ing's own category chip row: it
 * never wraps to a second row at any screen width, and a circular chevron
 * button fades smoothly in at whichever edge still has more chips to
 * reveal, and fades back out once you've scrolled all the way there. It's
 * just a plain horizontal scroller with a scrollBy trigger, not a custom
 * carousel widget -- confirmed on the live site.
 */
export function ShopCategoryTabs({
  suitableFor,
  shopCategory,
  className,
}: ShopCategoryTabsProps) {
  const router = useRouter();
  const entries = categoryGridForShop(suitableFor);
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
        aria-label="Kategorier"
      >
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              className="shop-category-tabs__chip"
              onClick={() =>
                navigateToChatEntry(router, { query: entry.query, shopCategory })
              }
            >
              {entry.label}
            </button>
          </li>
        ))}
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
        aria-label="Vis kategorier til venstre"
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
        aria-label="Vis kategorier til høyre"
        tabIndex={canScrollRight ? 0 : -1}
      >
        <ChevronRight className="size-4" strokeWidth={2.25} aria-hidden />
      </button>
    </div>
  );
}
