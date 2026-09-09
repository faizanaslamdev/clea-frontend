'use client';

import { cn } from '@/lib/utils';
import { CATEGORY_GRID_ENTRIES } from '@/lib/constants/category-grid';
import type { ProductFamily } from '@/lib/api/chat-types';

interface ShopCategoryTabsProps {
  active: ProductFamily | null;
  onSelect: (family: ProductFamily | null) => void;
  className?: string;
}

/**
 * Horizontally-scrollable category filter for the /shop page. Reuses the
 * same family list and Norwegian labels as the homepage category grid so
 * the two stay in sync — "Alle" (null) shows the unfiltered fashion catalog.
 */
export function ShopCategoryTabs({
  active,
  onSelect,
  className,
}: ShopCategoryTabsProps) {
  return (
    <ul className={cn('shop-category-tabs', className)} aria-label="Kategorier">
      <li>
        <button
          type="button"
          className={cn(
            'shop-category-tabs__chip',
            active === null && 'shop-category-tabs__chip--active',
          )}
          aria-pressed={active === null}
          onClick={() => onSelect(null)}
        >
          Alle
        </button>
      </li>
      {CATEGORY_GRID_ENTRIES.map((entry) => (
        <li key={entry.family}>
          <button
            type="button"
            className={cn(
              'shop-category-tabs__chip',
              active === entry.family && 'shop-category-tabs__chip--active',
            )}
            aria-pressed={active === entry.family}
            onClick={() => onSelect(entry.family)}
          >
            {entry.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
