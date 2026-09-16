'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { HeroSearchForm } from '@/components/hero-search-form';
import type { ShopCategory as ChatShopCategory } from '@/lib/api/chat-types';
import { navigateToChatEntry } from '@/lib/chat/chat-entry';
import { FLOATING_SEARCH_MIN_BOTTOM_PX } from '@/lib/ui/floating-search-dock';
import { cn } from '@/lib/utils';

interface ShopBrowseAssistantProps {
  /** Visible category/subcategory label used for placeholder + query context. */
  heading: string;
  /** Dame/Herre chat bootstrap; omit for non-gendered shelves (beauty, watches). */
  shopCategory?: ChatShopCategory;
  /** Stable id prefix for the input, e.g. `shop-overdeler-t-skjorter`. */
  entryKey: string;
  /** Hide while the Filter drawer is open so the two surfaces do not compete. */
  suppressed?: boolean;
}

/**
 * Scope wrapper for the sticky CLEA input. Must wrap all page content above
 * the site footer and render {@link ShopBrowseAssistant} as its last child so
 * `position: sticky; bottom` can float for the full scroll range, then release
 * into document flow at the scope end — no fixed↔relative mode switch (no jerk).
 */
export function ShopBrowseAssistantScope({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('shop-browse-assistant-scope', className)}>{children}</div>
  );
}

/**
 * Shop CLEA input with true FLOATING → LAND → DOCKED via CSS sticky.
 *
 * Render as the last child of {@link ShopBrowseAssistantScope}. While the
 * scope is scrolling the bar sticks to the viewport resting line; when the
 * scope ends (above the footer) sticky releases and the bar scrolls with the
 * page. Keyboard lift only adjusts the sticky `bottom` inset — never footer math.
 */
export function ShopBrowseAssistant({
  heading,
  shopCategory,
  entryKey,
  suppressed = false,
}: ShopBrowseAssistantProps) {
  const router = useRouter();
  const [keyboardLiftPx, setKeyboardLiftPx] = useState(0);

  const updateKeyboardLift = useCallback(() => {
    const viewport = window.visualViewport;
    if (!viewport) {
      setKeyboardLiftPx(0);
      return;
    }
    setKeyboardLiftPx(
      Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop),
    );
  }, []);

  useEffect(() => {
    updateKeyboardLift();
    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', updateKeyboardLift);
    viewport?.addEventListener('scroll', updateKeyboardLift);
    window.addEventListener('resize', updateKeyboardLift);
    return () => {
      viewport?.removeEventListener('resize', updateKeyboardLift);
      viewport?.removeEventListener('scroll', updateKeyboardLift);
      window.removeEventListener('resize', updateKeyboardLift);
    };
  }, [updateKeyboardLift]);

  const handleSubmit = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      const headingLower = heading.trim().toLowerCase();
      // Keep shelf context when the shopper types a short refinement
      // ("svart oversized under 800 kr") without repeating the category name.
      const contextualQuery =
        headingLower && !trimmed.toLowerCase().includes(headingLower)
          ? `${heading}: ${trimmed}`
          : trimmed;

      navigateToChatEntry(router, {
        query: contextualQuery,
        shopCategory,
      });
    },
    [router, heading, shopCategory],
  );

  const visible = !suppressed;
  const restingBottomPx = FLOATING_SEARCH_MIN_BOTTOM_PX + keyboardLiftPx;

  return (
    <div
      className="shop-browse-assistant-anchor"
      style={{
        bottom: `max(${restingBottomPx}px, env(safe-area-inset-bottom, 0px))`,
      }}
    >
      <div
        className={cn(
          'shop-browse-assistant',
          visible && 'shop-browse-assistant--visible',
        )}
        aria-hidden={!visible}
      >
        <HeroSearchForm
          variant="compact"
          appearance="floating"
          idPrefix={`shop-browse-${entryKey}`}
          shopCategory={shopCategory}
          placeholder={`Spør CLEA om ${heading.toLowerCase()}…`}
          onSubmitQuery={handleSubmit}
          inert={!visible}
          aria-hidden={!visible}
          className="shop-browse-assistant__bar"
        />
      </div>
    </div>
  );
}
