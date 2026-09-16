'use client';

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

/** In-category ontology chips only — hidden when the category has no children. */
export function ShopCategoryRefinements({
  category,
  state,
  onChange,
}: ShopCategoryRefinementsProps) {
  const children = shopCategoryChildrenFor(category, state.gender);
  if (children.length === 0) return null;

  return (
    <div
      className="shop-filter-bar__chips"
      role="group"
      aria-label="Underkategori"
    >
      <button
        type="button"
        className={cn('shop-filter-chip', !state.sub && 'shop-filter-chip--active')}
        aria-pressed={!state.sub}
        onClick={() => onChange({ sub: undefined })}
      >
        Alle {category.label.toLowerCase()}
      </button>
      {children.map((child) => (
        <button
          key={child.slug}
          type="button"
          className={cn(
            'shop-filter-chip',
            state.sub === child.slug && 'shop-filter-chip--active',
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
      ))}
    </div>
  );
}
