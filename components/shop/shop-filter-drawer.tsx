'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { CheckIcon, XIcon } from 'lucide-react';
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { CATALOG_SORT_LABELS, CATALOG_SORT_VALUES, type CatalogSort } from '@/lib/api/catalog-sort';
import type { CatalogFacets } from '@/lib/api/products';
import type { ShopCategory } from '@/lib/constants/shop-categories';
import { SHOP_COLOUR_OPTIONS } from '@/lib/shop/shop-colours';
import {
  shopFilterCapabilities,
  type ShopFilterCapabilities,
} from '@/lib/shop/shop-filter-capabilities';
import {
  commitPriceRange,
  countShopDrawerFilters,
  toggleBrandValue,
  toggleListValue,
  type ShopBrowseState,
} from '@/lib/shop/shop-browse-params';
import {
  brandFacetOptions,
  colourFacetOptions,
  storeFacetOptions,
  type FacetOption,
} from '@/lib/shop/shop-facet-options';
import type { Store } from '@/lib/types';
import { cn } from '@/lib/utils';

const PRICE_DEBOUNCE_MS = 650;
/** Brands shown before "Vis alle merker". */
const BRAND_PREVIEW_COUNT = 10;

/** Search results: every filter except Shop-only subcategory / gender rows. */
export const SEARCH_FILTER_CAPABILITIES: ShopFilterCapabilities = {
  subcategory: false,
  brand: true,
  store: true,
  price: true,
  colour: true,
  sale: true,
  sort: true,
  gender: false,
};

interface ShopFilterDrawerProps {
  /** Shop category the drawer filters; omit and pass `capabilities` elsewhere (search). */
  category?: ShopCategory;
  capabilities?: ShopFilterCapabilities;
  state: ShopBrowseState;
  /** Store directory, used only for display names. */
  stores: readonly Store[];
  /** Options + counts for the current filters (undefined while first loading). */
  facets: CatalogFacets | undefined;
  /**
   * True while `facets` still holds the previous selection's counts (a new
   * selection is loading). The options stay visible; the total is hidden so
   * the apply button never shows a stale number.
   */
  facetsPending?: boolean;
  onChange: (patch: Partial<ShopBrowseState>) => void;
  onReset: () => void;
  /** Lets the page suppress the floating CLEA assistant while filters are open. */
  onOpenChange?: (open: boolean) => void;
}

const formatCount = (count: number) => count.toLocaleString('nb-NO');

function CheckRow({
  option,
  onToggle,
}: {
  option: FacetOption;
  onToggle: () => void;
}) {
  const disabled = option.count === 0 && !option.selected;
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={option.selected}
        disabled={disabled}
        className={cn(
          'shop-filter-option',
          option.selected && 'shop-filter-option--selected',
        )}
        onClick={onToggle}
      >
        <span className="shop-filter-option__box" aria-hidden="true">
          {option.selected && <CheckIcon className="size-3.5" />}
        </span>
        <span className="shop-filter-option__label">{option.label}</span>
        <span className="shop-filter-option__count">{formatCount(option.count)}</span>
      </button>
    </li>
  );
}

export function ShopFilterDrawer({
  category,
  capabilities: capabilitiesOverride,
  state,
  stores,
  facets,
  facetsPending = false,
  onChange,
  onReset,
  onOpenChange,
}: ShopFilterDrawerProps) {
  const capabilities = useMemo(
    () =>
      capabilitiesOverride ??
      (category ? shopFilterCapabilities(category) : SEARCH_FILTER_CAPABILITIES),
    [capabilitiesOverride, category],
  );
  const activeCount = countShopDrawerFilters(state);

  const [open, setOpen] = useState(false);
  const [brandQuery, setBrandQuery] = useState('');
  const [showAllBrands, setShowAllBrands] = useState(false);

  const sortId = useId();
  const brandSearchId = useId();

  const storeOptions = useMemo(
    () => storeFacetOptions(facets, state.merchantIds, stores),
    [facets, state.merchantIds, stores],
  );
  const brandOptions = useMemo(
    () => brandFacetOptions(facets, state.brands, brandQuery),
    [facets, state.brands, brandQuery],
  );
  const colourOptions = useMemo(
    () => colourFacetOptions(facets, state.colours, SHOP_COLOUR_OPTIONS),
    [facets, state.colours],
  );
  const visibleBrands =
    showAllBrands || brandQuery.trim()
      ? brandOptions
      : brandOptions.slice(0, Math.max(BRAND_PREVIEW_COUNT, state.brands.length));

  const [minDraft, setMinDraft] = useState(
    state.minPrice != null ? String(state.minPrice) : '',
  );
  const [maxDraft, setMaxDraft] = useState(
    state.maxPrice != null ? String(state.maxPrice) : '',
  );
  const minDraftRef = useRef(minDraft);
  const maxDraftRef = useRef(maxDraft);
  minDraftRef.current = minDraft;
  maxDraftRef.current = maxDraft;

  useEffect(() => {
    setMinDraft(state.minPrice != null ? String(state.minPrice) : '');
    setMaxDraft(state.maxPrice != null ? String(state.maxPrice) : '');
  }, [state.minPrice, state.maxPrice]);

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

  useEffect(
    () => () => {
      if (priceTimer.current) clearTimeout(priceTimer.current);
    },
    [],
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      if (priceTimer.current) {
        clearTimeout(priceTimer.current);
        priceTimer.current = null;
      }
      commitPrices(minDraftRef.current, maxDraftRef.current);
    }
    setOpen(next);
    onOpenChange?.(next);
  };

  const close = () => handleOpenChange(false);
  const total = facetsPending ? undefined : facets?.total;
  const showSale =
    capabilities.sale && (state.onSale || (facets?.onSaleCount ?? 0) > 0);
  const showColours = capabilities.colour && colourOptions.length > 0;

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
            event.preventDefault();
            document
              .querySelector<HTMLButtonElement>('.shop-filter-trigger')
              ?.focus();
          }}
        >
          <div className="shop-filter-drawer__header">
            <DialogTitle className="shop-filter-drawer__title">Filter</DialogTitle>
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

            {capabilities.store && storeOptions.length > 0 && (
              <fieldset className="shop-filter-drawer__field">
                <legend className="shop-filter-drawer__label">Butikk</legend>
                <ul className="shop-filter-options">
                  {storeOptions.map((option) => (
                    <CheckRow
                      key={option.value}
                      option={option}
                      onToggle={() =>
                        onChange({
                          merchantIds: toggleListValue(state.merchantIds, option.value),
                        })
                      }
                    />
                  ))}
                </ul>
              </fieldset>
            )}

            {capabilities.brand && (brandOptions.length > 0 || brandQuery) && (
              <fieldset className="shop-filter-drawer__field">
                <legend className="shop-filter-drawer__label">Merke</legend>
                <label htmlFor={brandSearchId} className="sr-only">
                  Søk etter merke
                </label>
                <input
                  id={brandSearchId}
                  type="search"
                  className="shop-filter-drawer__control"
                  placeholder="Søk etter merke"
                  autoComplete="off"
                  value={brandQuery}
                  onChange={(event) => setBrandQuery(event.target.value)}
                />
                {visibleBrands.length > 0 ? (
                  <ul className="shop-filter-options">
                    {visibleBrands.map((option) => (
                      <CheckRow
                        key={option.value}
                        option={option}
                        onToggle={() =>
                          onChange({
                            brands: toggleBrandValue(state.brands, option.value),
                          })
                        }
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="shop-filter-drawer__empty">
                    Ingen merker matcher «{brandQuery.trim()}» her.
                  </p>
                )}
                {!brandQuery.trim() && brandOptions.length > visibleBrands.length && (
                  <button
                    type="button"
                    className="shop-filter-more"
                    onClick={() => setShowAllBrands(true)}
                  >
                    Vis alle merker ({formatCount(brandOptions.length)})
                  </button>
                )}
              </fieldset>
            )}

            {showColours && (
              <fieldset className="shop-filter-drawer__field">
                <legend className="shop-filter-drawer__label">Farge</legend>
                <ul className="shop-filter-swatches">
                  {colourOptions.map((option) => (
                    <li key={option.value}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={option.selected}
                        disabled={option.count === 0 && !option.selected}
                        className={cn(
                          'shop-filter-swatch',
                          option.selected && 'shop-filter-swatch--selected',
                        )}
                        onClick={() =>
                          onChange({
                            colours: toggleListValue(state.colours, option.value),
                          })
                        }
                      >
                        <span
                          className="shop-filter-swatch__dot"
                          style={{ background: option.swatch }}
                          aria-hidden="true"
                        />
                        <span>{option.label}</span>
                        <span className="shop-filter-option__count">
                          {formatCount(option.count)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </fieldset>
            )}

            {capabilities.price && (
              <div className="shop-filter-drawer__field">
                <span className="shop-filter-drawer__label">Pris (kr)</span>
                <div className="shop-filter-drawer__price">
                  <input
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

            {showSale && (
              <button
                type="button"
                className={cn(
                  'shop-filter-sale shop-filter-drawer__sale',
                  state.onSale && 'shop-filter-sale--active',
                )}
                aria-pressed={Boolean(state.onSale)}
                onClick={() => onChange({ onSale: state.onSale ? undefined : true })}
              >
                På salg
                {facets && !facetsPending && !state.onSale && ` (${formatCount(facets.onSaleCount)})`}
              </button>
            )}
          </div>

          <div className="shop-filter-drawer__footer">
            {activeCount > 0 && (
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
                  setMinDraft('');
                  setMaxDraft('');
                  setBrandQuery('');
                  onReset();
                }}
              >
                Nullstill
              </button>
            )}
            <button type="button" className="shop-filter-apply" onClick={close}>
              {total == null
                ? 'Vis produkter'
                : total === 1
                  ? 'Vis 1 produkt'
                  : `Vis ${formatCount(total)} produkter`}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
