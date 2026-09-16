'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { CATALOG_SORT_LABELS, CATALOG_SORT_VALUES, type CatalogSort } from '@/lib/api/catalog-sort';
import type { CatalogBrowseBrand } from '@/lib/api/products';
import type { ShopCategory } from '@/lib/constants/shop-categories';
import {
  commitPriceRange,
  type ShopBrowseState,
} from '@/lib/shop/shop-browse-params';
import type { Store } from '@/lib/types';
import { cn } from '@/lib/utils';

const PRICE_DEBOUNCE_MS = 650;

interface ShopFilterBarProps {
  category: ShopCategory;
  state: ShopBrowseState;
  stores: readonly Store[];
  brands: readonly CatalogBrowseBrand[];
  isFiltered: boolean;
  onChange: (patch: Partial<ShopBrowseState>) => void;
  onReset: () => void;
}

export function ShopFilterBar({
  category,
  state,
  stores,
  brands,
  isFiltered,
  onChange,
  onReset,
}: ShopFilterBarProps) {
  const sortId = useId();
  const storeId = useId();
  const brandId = useId();
  const minId = useId();
  const maxId = useId();
  const brandListId = useId();

  const [minDraft, setMinDraft] = useState(
    state.minPrice != null ? String(state.minPrice) : '',
  );
  const [maxDraft, setMaxDraft] = useState(
    state.maxPrice != null ? String(state.maxPrice) : '',
  );
  const [brandDraft, setBrandDraft] = useState(state.brand ?? '');

  // Keep drafts in sync when URL changes from outside (reset, Back, shared link).
  useEffect(() => {
    setMinDraft(state.minPrice != null ? String(state.minPrice) : '');
    setMaxDraft(state.maxPrice != null ? String(state.maxPrice) : '');
  }, [state.minPrice, state.maxPrice]);

  useEffect(() => {
    setBrandDraft(state.brand ?? '');
  }, [state.brand]);

  const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commitPrices = (minValue: string, maxValue: string) => {
    const next = commitPriceRange(minValue, maxValue);
    if (next.minPrice === state.minPrice && next.maxPrice === state.maxPrice) {
      return;
    }
    onChange(next);
  };

  const schedulePriceCommit = (minValue: string, maxValue: string) => {
    if (priceTimer.current) clearTimeout(priceTimer.current);
    priceTimer.current = setTimeout(() => {
      commitPrices(minValue, maxValue);
    }, PRICE_DEBOUNCE_MS);
  };

  useEffect(
    () => () => {
      if (priceTimer.current) clearTimeout(priceTimer.current);
    },
    [],
  );

  const commitBrand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      if (state.brand) onChange({ brand: undefined });
      setBrandDraft('');
      return;
    }
    const match =
      brands.find(
        (entry) => entry.brand.toLowerCase() === trimmed.toLowerCase(),
      ) ?? brands.find((entry) =>
        entry.brand.toLowerCase().startsWith(trimmed.toLowerCase()),
      );
    const brand = match?.brand ?? trimmed;
    setBrandDraft(brand);
    if (brand !== state.brand) onChange({ brand });
  };

  return (
    <div className="shop-filter-bar">
      {category.children.length > 0 && (
        <div className="shop-filter-bar__chips" role="group" aria-label="Underkategori">
          <button
            type="button"
            className={cn('shop-filter-chip', !state.sub && 'shop-filter-chip--active')}
            aria-pressed={!state.sub}
            onClick={() => onChange({ sub: undefined })}
          >
            Alle {category.label.toLowerCase()}
          </button>
          {category.children.map((child) => (
            <button
              key={child.slug}
              type="button"
              className={cn(
                'shop-filter-chip',
                state.sub === child.slug && 'shop-filter-chip--active',
              )}
              aria-pressed={state.sub === child.slug}
              onClick={() =>
                onChange({ sub: state.sub === child.slug ? undefined : child.slug })
              }
            >
              {child.label}
            </button>
          ))}
        </div>
      )}

      <div className="shop-filter-bar__controls">
        <div className="shop-filter-field">
          <label htmlFor={sortId} className="shop-filter-field__label">
            Sorter
          </label>
          <select
            id={sortId}
            className="shop-filter-field__select"
            value={state.sort}
            onChange={(event) => onChange({ sort: event.target.value as CatalogSort })}
          >
            {CATALOG_SORT_VALUES.map((value) => (
              <option key={value} value={value}>
                {CATALOG_SORT_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="shop-filter-field">
          <label htmlFor={brandId} className="shop-filter-field__label">
            Merke
          </label>
          <input
            id={brandId}
            className="shop-filter-field__select"
            list={brandListId}
            placeholder="Alle merker"
            autoComplete="off"
            value={brandDraft}
            onChange={(event) => {
              const value = event.target.value;
              setBrandDraft(value);
              // Datalist pick commits immediately when it matches a known brand.
              const exact = brands.find(
                (entry) => entry.brand.toLowerCase() === value.trim().toLowerCase(),
              );
              if (exact && exact.brand !== state.brand) {
                onChange({ brand: exact.brand });
              }
            }}
            onBlur={() => commitBrand(brandDraft)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commitBrand(brandDraft);
                (event.target as HTMLInputElement).blur();
              }
            }}
          />
          <datalist id={brandListId}>
            {brands.slice(0, 200).map((entry) => (
              <option key={entry.brand} value={entry.brand} />
            ))}
          </datalist>
        </div>

        <div className="shop-filter-field">
          <label htmlFor={storeId} className="shop-filter-field__label">
            Butikk
          </label>
          <select
            id={storeId}
            className="shop-filter-field__select"
            value={state.merchantId ?? ''}
            onChange={(event) =>
              onChange({ merchantId: event.target.value || undefined })
            }
          >
            <option value="">Alle butikker</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        <div className="shop-filter-field shop-filter-field--price">
          <span className="shop-filter-field__label">Pris (kr)</span>
          <div className="shop-filter-price">
            <input
              id={minId}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="Fra"
              aria-label="Laveste pris"
              className="shop-filter-price__input"
              value={minDraft}
              onChange={(event) => {
                const value = event.target.value;
                setMinDraft(value);
                schedulePriceCommit(value, maxDraft);
              }}
              onBlur={() => {
                if (priceTimer.current) clearTimeout(priceTimer.current);
                commitPrices(minDraft, maxDraft);
              }}
            />
            <span aria-hidden="true" className="shop-filter-price__dash">
              –
            </span>
            <input
              id={maxId}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="Til"
              aria-label="Høyeste pris"
              className="shop-filter-price__input"
              value={maxDraft}
              onChange={(event) => {
                const value = event.target.value;
                setMaxDraft(value);
                schedulePriceCommit(minDraft, value);
              }}
              onBlur={() => {
                if (priceTimer.current) clearTimeout(priceTimer.current);
                commitPrices(minDraft, maxDraft);
              }}
            />
          </div>
        </div>

        {isFiltered && (
          <button type="button" className="shop-filter-reset" onClick={onReset}>
            Nullstill
          </button>
        )}
      </div>
    </div>
  );
}
