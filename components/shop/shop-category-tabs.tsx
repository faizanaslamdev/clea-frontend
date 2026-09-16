'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navigateToChatEntry } from '@/lib/chat/chat-entry';
import { categoryGridForShop } from '@/lib/constants/category-grid';
import {
  shopBrowseHrefForGridEntry,
  shopBrowseTargetForGridEntry,
} from '@/lib/constants/shop-categories';
import type { ShopCategory, SuitableFor } from '@/lib/api/chat-types';

interface ShopCategoryTabsProps {
  /** Current Dame/Herre toggle — picks the gender-specific chip list and
   * is carried into chat so a chip click keeps the same browsing context. */
  suitableFor: SuitableFor;
  shopCategory?: ShopCategory;
  /** Current /shop/[category] slug, so the row can mark where you are. */
  activeSlug?: string;
  /** Current `?sub=` value — `tees` and `tops` both land on /shop/overdeler. */
  activeSub?: string;
  className?: string;
}

/** How far one arrow click scrolls the chip row. */
const SCROLL_STEP_PX = 240;
/** Scroll-edge slack before we call the row "at the start/end" -- avoids
 * the arrow flickering on a 1px sub-pixel rounding difference. */
const SCROLL_EDGE_SLACK_PX = 4;

/**
 * Horizontally-scrollable category chip row for the /shop page. Each chip
 * links into the browse grid at /shop/[category] (same destination as the
 * category fan cards below it), so shoppers have a path that does not depend
 * on the AI returning the right thing. A chip with no browse destination
 * falls back to launching chat. Dame/Herre each get their own equal-length
 * chip list so the row never reflows on gender toggle.
 *
 * Scroll arrows stay on one row at every width; a circular chevron fades in
 * when the track can scroll further in that direction.
 */
export function ShopCategoryTabs({
  suitableFor,
  shopCategory,
  activeSlug,
  activeSub,
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
        {entries.map((entry) => {
          const href = shopBrowseHrefForGridEntry(entry.id, suitableFor);
          const target = shopBrowseTargetForGridEntry(entry.id);
          const isActive =
            target !== undefined &&
            target.slug === activeSlug &&
            (target.sub ?? undefined) === (activeSub ?? undefined);

          return (
            <li key={entry.id}>
              {href ? (
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'shop-category-tabs__chip',
                    isActive && 'shop-category-tabs__chip--active',
                  )}
                >
                  {entry.label}
                </Link>
              ) : (
                <button
                  type="button"
                  className="shop-category-tabs__chip"
                  onClick={() =>
                    navigateToChatEntry(router, {
                      query: entry.query,
                      shopCategory,
                    })
                  }
                >
                  {entry.label}
                </button>
              )}
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
