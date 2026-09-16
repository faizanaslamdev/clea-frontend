'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  shopCategoryChildrenFor,
  type ShopCategory,
} from '@/lib/constants/shop-categories';
import type { ShopBrowseState } from '@/lib/shop/shop-browse-params';

interface ShopCategoryRefinementsProps {
  category: ShopCategory;
  state: ShopBrowseState;
  onChange: (patch: Partial<ShopBrowseState>) => void;
}

/** How far one arrow click scrolls the chip row (matches /shop hub tabs). */
const SCROLL_STEP_PX = 240;
const SCROLL_EDGE_SLACK_PX = 4;

/**
 * In-category ontology chips — same horizontally-scrolling chip row as the
 * /shop hub quick suggestions (single line, edge fades + scroll arrows).
 * Hidden when the category has no children.
 */
export function ShopCategoryRefinements({
  category,
  state,
  onChange,
}: ShopCategoryRefinementsProps) {
  const children = shopCategoryChildrenFor(category, state.gender);
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
  }, [category.slug, state.gender, children.length, updateScrollState]);

  if (children.length === 0) return null;

  const scrollByStep = (delta: number) => {
    trackRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div className="shop-category-tabs-wrap shop-category-refinements">
      <ul
        ref={trackRef}
        className="shop-category-tabs"
        role="group"
        aria-label="Underkategori"
      >
        <li>
          <button
            type="button"
            className={cn(
              'shop-category-tabs__chip',
              !state.sub && 'shop-category-tabs__chip--active',
            )}
            aria-pressed={!state.sub}
            onClick={() => onChange({ sub: undefined })}
          >
            Alle {category.label.toLowerCase()}
          </button>
        </li>
        {children.map((child) => (
          <li key={child.slug}>
            <button
              type="button"
              className={cn(
                'shop-category-tabs__chip',
                state.sub === child.slug && 'shop-category-tabs__chip--active',
              )}
              aria-pressed={state.sub === child.slug}
              onClick={() =>
                onChange({
                  sub: state.sub === child.slug ? undefined : child.slug,
                })
              }
            >
              {child.label}
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
        aria-label="Vis underkategorier til venstre"
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
        aria-label="Vis underkategorier til høyre"
        tabIndex={canScrollRight ? 0 : -1}
      >
        <ChevronRight className="size-4" strokeWidth={2.25} aria-hidden />
      </button>
    </div>
  );
}
