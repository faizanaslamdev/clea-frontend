'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { CATALOG_SORT_LABELS, CATALOG_SORT_VALUES, type CatalogSort } from '@/lib/api/catalog-sort';
import type { CatalogBrowseBrand } from '@/lib/api/products';
import type { ShopCategory } from '@/lib/constants/shop-categories';
import { SHOP_COLOUR_OPTIONS } from '@/lib/shop/shop-colours';
import { shopFilterCapabilities } from '@/lib/shop/shop-filter-capabilities';
import {
  commitPriceRange,
  countShopDrawerFilters,
  type ShopBrowseState,
} from '@/lib/shop/shop-browse-params';
import type { Store } from '@/lib/types';
import { cn } from '@/lib/utils';

const PRICE_DEBOUNCE_MS = 650;

interface ShopFilterDrawerProps {
  category: ShopCategory;
  state: ShopBrowseState;
  stores: readonly Store[];
  brands: readonly CatalogBrowseBrand[];
  onChange: (patch: Partial<ShopBrowseState>) => void;
  onReset: () => void;
  /** Lets the page suppress the floating CLEA assistant while filters are open. */
  onOpenChange?: (open: boolean) => void;
}

export function ShopFilterDrawer({
  category,
  state,
  stores,
  brands,
  onChange,
  onReset,
  onOpenChange,
}: ShopFilterDrawerProps) {
  const capabilities = useMemo(
    () => shopFilterCapabilities(category),
    [category],
  );
  const activeCount = countShopDrawerFilters(state);

  const [open, setOpen] = useState(false);

  const sortId = useId();
  const storeId = useId();
  const brandId = useId();
  const colourId = useId();
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

  const minDraftRef = useRef(minDraft);
  const maxDraftRef = useRef(maxDraft);
  const brandDraftRef = useRef(brandDraft);
  minDraftRef.current = minDraft;
  maxDraftRef.current = maxDraft;
  brandDraftRef.current = brandDraft;

  useEffect(() => {
    setMinDraft(state.minPrice != null ? String(state.minPrice) : '');
    setMaxDraft(state.maxPrice != null ? String(state.maxPrice) : '');
  }, [state.minPrice, state.maxPrice]);

  useEffect(() => {
    setBrandDraft(state.brand ?? '');
  }, [state.brand]);

  const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const commitPrices = (minValue: string, maxValue: string) => {
    const next = commitPriceRange(minValue, maxValue);
    const current = stateRef.current;
    if (next.minPrice === current.minPrice && next.maxPrice === current.maxPrice) {
      return;
    }
    onChangeRef.current(next);
  };

  const schedulePriceCommit = (minValue: string, maxValue: string) => {
    if (priceTimer.current) clearTimeout(priceTimer.current);
    priceTimer.current = setTimeout(() => {
      commitPrices(minValue, maxValue);
    }, PRICE_DEBOUNCE_MS);
  };

  const commitBrand = (raw: string) => {
    const trimmed = raw.trim();
    const current = stateRef.current;
    if (!trimmed) {
      if (current.brand) onChangeRef.current({ brand: undefined });
      setBrandDraft('');
      return;
    }
    const match =
      brands.find(
        (entry) => entry.brand.toLowerCase() === trimmed.toLowerCase(),
      ) ??
      brands.find((entry) =>
        entry.brand.toLowerCase().startsWith(trimmed.toLowerCase()),
      );
    const brand = match?.brand ?? trimmed;
    setBrandDraft(brand);
    if (brand !== current.brand) onChangeRef.current({ brand });
  };

  const flushPending = () => {
    if (priceTimer.current) {
      clearTimeout(priceTimer.current);
      priceTimer.current = null;
    }
    commitPrices(minDraftRef.current, maxDraftRef.current);
    commitBrand(brandDraftRef.current);
  };

  useEffect(
    () => () => {
      if (priceTimer.current) clearTimeout(priceTimer.current);
    },
    [],
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) flushPending();
    setOpen(next);
    onOpenChange?.(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <button
        type="button"
        className="shop-filter-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => handleOpenChange(true)}
      >
        {activeCount > 0 ? `Filter (${activeCount})` : 'Filter'}
      </button>

      <DialogPortal>
        <DialogOverlay className="shop-filter-drawer__overlay" />
        <DialogPrimitive.Content
          className="shop-filter-drawer"
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            // Return focus to the trigger; Radix default is fine but keep explicit.
            event.preventDefault();
            const trigger = document.querySelector<HTMLButtonElement>(
              '.shop-filter-trigger',
            );
            trigger?.focus();
          }}
        >
          <div className="shop-filter-drawer__header">
            <DialogTitle className="shop-filter-drawer__title">
              Filter
            </DialogTitle>
            <DialogDescription className="sr-only">
              Sorter og snevre inn produktlisten. Endringer lagres i adressen.
            </DialogDescription>
            <DialogPrimitive.Close
              type="button"
              className="shop-filter-drawer__close"
              aria-label="Lukk filter"
            >
              <XIcon className="size-5" aria-hidden />
            </DialogPrimitive.Close>
          </div>

          <div className="shop-filter-drawer__body">
            {capabilities.sort && (
              <div className="shop-filter-drawer__field">
                <label htmlFor={sortId} className="shop-filter-drawer__label">
                  Sorter
                </label>
                <select
                  id={sortId}
                  className="shop-filter-drawer__control"
                  value={state.sort}
                  onChange={(event) =>
                    onChange({ sort: event.target.value as CatalogSort })
                  }
                >
                  {CATALOG_SORT_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {CATALOG_SORT_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {capabilities.brand && (
              <div className="shop-filter-drawer__field">
                <label htmlFor={brandId} className="shop-filter-drawer__label">
                  Merke
                </label>
                <input
                  id={brandId}
                  className="shop-filter-drawer__control"
                  list={brandListId}
                  placeholder="Alle merker"
                  autoComplete="off"
                  value={brandDraft}
                  onChange={(event) => {
                    const value = event.target.value;
                    setBrandDraft(value);
                    const exact = brands.find(
                      (entry) =>
                        entry.brand.toLowerCase() ===
                        value.trim().toLowerCase(),
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
            )}

            {capabilities.colour && SHOP_COLOUR_OPTIONS.length > 0 && (
              <div className="shop-filter-drawer__field">
                <label htmlFor={colourId} className="shop-filter-drawer__label">
                  Farge
                </label>
                <select
                  id={colourId}
                  className="shop-filter-drawer__control"
                  value={state.colour ?? ''}
                  onChange={(event) =>
                    onChange({ colour: event.target.value || undefined })
                  }
                >
                  <option value="">Alle farger</option>
                  {SHOP_COLOUR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {capabilities.store && (
              <div className="shop-filter-drawer__field">
                <label htmlFor={storeId} className="shop-filter-drawer__label">
                  Butikk
                </label>
                <select
                  id={storeId}
                  className="shop-filter-drawer__control"
                  value={state.merchantId ?? ''}
                  onChange={(event) =>
                    onChange({
                      merchantId: event.target.value || undefined,
                    })
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
            )}

            {capabilities.price && (
              <div className="shop-filter-drawer__field">
                <span className="shop-filter-drawer__label">Pris (kr)</span>
                <div className="shop-filter-drawer__price">
                  <input
                    id={minId}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    placeholder="Fra"
                    aria-label="Laveste pris"
                    className="shop-filter-drawer__control shop-filter-drawer__control--price"
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
                    className="shop-filter-drawer__control shop-filter-drawer__control--price"
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
            )}

            {capabilities.sale && (
              <button
                type="button"
                className={cn(
                  'shop-filter-sale shop-filter-drawer__sale',
                  state.onSale && 'shop-filter-sale--active',
                )}
                aria-pressed={Boolean(state.onSale)}
                onClick={() =>
                  onChange({ onSale: state.onSale ? undefined : true })
                }
              >
                På salg
              </button>
            )}
          </div>

          {activeCount > 0 && (
            <div className="shop-filter-drawer__footer">
              <button
                type="button"
                className="shop-filter-reset"
                onClick={() => {
                  if (priceTimer.current) {
                    clearTimeout(priceTimer.current);
                    priceTimer.current = null;
                  }
                  // Clear drafts synchronously so close-flush cannot revive filters.
                  minDraftRef.current = '';
                  maxDraftRef.current = '';
                  brandDraftRef.current = '';
                  setMinDraft('');
                  setMaxDraft('');
                  setBrandDraft('');
                  onReset();
                  setOpen(false);
                  onOpenChange?.(false);
                }}
              >
                Nullstill filtre
              </button>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
