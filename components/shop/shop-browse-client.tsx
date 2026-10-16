'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/product-grid';
import { LoadMoreButton } from '@/components/shared/load-more-button';
import { ShopBrowseAssistant, ShopBrowseAssistantScope } from '@/components/shop/shop-browse-assistant';
import { ShopCategoryRefinements } from '@/components/shop/shop-category-refinements';
import { ShopFilterDrawer } from '@/components/shop/shop-filter-drawer';
import { ShopPendingSurface } from '@/components/shop/shop-pending-surface';
import type { ShopCategory } from '@/lib/constants/shop-categories';
import { useCatalogFacets } from '@/lib/hooks/useCatalogFacets';
import { useCatalogInfinite } from '@/lib/hooks/useCatalogInfinite';
import { useShopPendingLabel, useShopPendingItems, useShopPendingTransition } from '@/lib/hooks/useShopPending';
import {
  buildShopBrowseQuery,
  emptyShopBrowseState,
  isShopBrowseFiltered,
  parseShopBrowseState,
  shopBrowseFilters,
  type ShopBrowseState,
} from '@/lib/shop/shop-browse-params';
import { shopCategoryFor, shopGenderParamFor } from '@/lib/shop/shop-gender';
import { shopBrowsePendingLabel } from '@/lib/shop/shop-pending';
import { productKeys } from '@/lib/query/keys';
import type { Store } from '@/lib/types';

interface ShopBrowseClientProps {
  category: ShopCategory;
  stores: readonly Store[];
}

function ShopBrowseContent({ category, stores }: ShopBrowseClientProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);

  const state = useMemo(
    () =>
      parseShopBrowseState(
        new URLSearchParams(searchParams.toString()),
        category,
      ),
    [searchParams, category],
  );

  const filters = useMemo(
    () => shopBrowseFilters(category, state),
    [category, state],
  );
  const isFiltered = isShopBrowseFiltered(state);

  const activeChild = state.sub
    ? category.children.find((child) => child.slug === state.sub)
    : undefined;
  const heading = activeChild?.label ?? category.label;
  const audienceLabel =
    state.gender === 'male' ? 'Herre' : state.gender === 'female' ? 'Dame' : null;
  const hubHref = category.gendered
    ? `/shop?gender=${shopGenderParamFor(state.gender)}`
    : '/shop';
  const chatShopCategory = category.gendered
    ? shopCategoryFor(state.gender)
    : undefined;
  const assistantEntryKey = `shop-${category.slug}${state.sub ? `-${state.sub}` : ''}`;

  // replace (not push): one Shop URL so product → Back restores this filtered
  // view without a history entry per refinement.
  // Native replaceState (synced into useSearchParams by the App Router) instead
  // of router.replace: the page is static and ignores search params, so a
  // server round trip per click only delayed the update and left the previous
  // count on screen until it returned.
  const applyState = useCallback(
    (next: ShopBrowseState) => {
      const query = buildShopBrowseQuery(next);
      window.history.replaceState(null, '', query ? `${pathname}?${query}` : pathname);
    },
    [pathname],
  );

  const handleChange = useCallback(
    (patch: Partial<ShopBrowseState>) => applyState({ ...state, ...patch }),
    [applyState, state],
  );

  const handleReset = useCallback(
    () => applyState(emptyShopBrowseState(state.gender)),
    [applyState, state.gender],
  );

  const {
    data,
    isLoading,
    isError,
    isPlaceholderData,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCatalogInfinite(filters);

  const { data: facets, isPlaceholderData: facetsPending } = useCatalogFacets(filters);

  const products = data?.pages.flatMap((page) => page.products) ?? [];
  const loaded = products.length;
  // Exact total from facets; while it loads, the last page tells us when the
  // list is complete, otherwise show what has loaded as a lower bound.
  const lastPage = data?.pages[data.pages.length - 1];
  // While a new selection loads, both queries still hold the previous
  // selection's data (keepPreviousData) — never show that count as current.
  const countPending = facetsPending || isPlaceholderData;
  const total = facetsPending
    ? null
    : (facets?.total ?? (lastPage && !lastPage.hasMore ? loaded : null));
  // Prefer previous products over an empty skeleton while the next set loads.
  const showSkeleton = isLoading && products.length === 0;

  // Every chip/filter change — including warm cache hits — starts pending.
  const transitionKey = JSON.stringify(productKeys.catalog(filters));
  const dataPending = isPlaceholderData || showSkeleton;
  const pending = useShopPendingTransition(transitionKey, dataPending);
  const visibleProducts = useShopPendingItems(pending, products);
  const statusLabel = useShopPendingLabel(
    pending,
    shopBrowsePendingLabel({
      heading,
      state,
      cold: showSkeleton,
    }),
  );

  return (
    <ShopBrowseAssistantScope>
      <div className="section-container pt-8">
        <header className="mb-4 flex flex-col gap-1">
          <nav aria-label="Brødsmuler" className="shop-breadcrumb">
            <Link href={hubHref}>Handle</Link>
            {category.gendered && audienceLabel && (
              <>
                <span aria-hidden="true">/</span>
                <Link href={hubHref}>{audienceLabel}</Link>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span>{category.label}</span>
          </nav>
          <h1 className="type-heading shop-browse__title">{heading}</h1>
        </header>

        <ShopCategoryRefinements
          category={category}
          state={state}
          onChange={handleChange}
        />

        <div className="shop-browse__toolbar">
          <div className="shop-browse__meta">
            {pending && showSkeleton ? (
              <span>Laster produkter …</span>
            ) : countPending ? (
              <span>Oppdaterer …</span>
            ) : (
              <span>
                {total != null
                  ? `${total.toLocaleString('nb-NO')} ${total === 1 ? 'produkt' : 'produkter'}`
                  : `${loaded.toLocaleString('nb-NO')}+ produkter`}
              </span>
            )}
          </div>
          <ShopFilterDrawer
            category={category}
            state={state}
            stores={stores}
            facets={facets}
            facetsPending={facetsPending}
            onChange={handleChange}
            onReset={handleReset}
            onOpenChange={setFilterOpen}
          />
        </div>
      </div>

      <ShopPendingSurface
        pending={pending}
        label={statusLabel}
        className="section-container shop-browse__grid"
      >
        {isError ? (
          <div className="shop-browse__state">
            <p>Kunne ikke laste produkter. Prøv igjen.</p>
            <button
              type="button"
              className="shop-filter-reset"
              onClick={() => void refetch()}
            >
              Prøv igjen
            </button>
          </div>
        ) : showSkeleton ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="aspect-3/4 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="shop-browse__state">
            <p>
              Ingen produkter matchet filtrene dine i {heading.toLowerCase()}.
            </p>
            {isFiltered && (
              <button
                type="button"
                className="shop-filter-reset"
                onClick={handleReset}
              >
                Nullstill filtre
              </button>
            )}
          </div>
        ) : (
          <>
            <ProductGrid
              products={visibleProducts}
              showMerchantLabel
              enableAnchorActions
            />
            {hasNextPage && (
              <LoadMoreButton
                onClick={() => void fetchNextPage()}
                loading={isFetchingNextPage}
              />
            )}
          </>
        )}
      </ShopPendingSurface>

      <ShopBrowseAssistant
        heading={heading}
        shopCategory={chatShopCategory}
        entryKey={assistantEntryKey}
        suppressed={filterOpen}
      />
    </ShopBrowseAssistantScope>
  );
}

export function ShopBrowseClient(props: ShopBrowseClientProps) {
  return (
    <Suspense fallback={null}>
      <ShopBrowseContent {...props} />
    </Suspense>
  );
}
