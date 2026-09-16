'use client';

import { Suspense, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/product-grid';
import { LoadMoreButton } from '@/components/shared/load-more-button';
import { ShopBrowseStatus } from '@/components/shop/shop-browse-status';
import { ShopCategoryRefinements } from '@/components/shop/shop-category-refinements';
import { ShopFilterDrawer } from '@/components/shop/shop-filter-drawer';
import type { CatalogBrowseBrand } from '@/lib/api/products';
import { buildChatEntryUrl } from '@/lib/chat/chat-entry';
import type { ShopCategory } from '@/lib/constants/shop-categories';
import { useCatalogInfinite } from '@/lib/hooks/useCatalogInfinite';
import {
  buildShopBrowseQuery,
  isShopBrowseFiltered,
  parseShopBrowseState,
  shopBrowseFilters,
  type ShopBrowseState,
} from '@/lib/shop/shop-browse-params';
import { shopGenderParamFor } from '@/lib/shop/shop-gender';
import type { Store } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ShopBrowseClientProps {
  category: ShopCategory;
  stores: readonly Store[];
  brands: readonly CatalogBrowseBrand[];
}

function ShopBrowseContent({
  category,
  stores,
  brands,
}: ShopBrowseClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  // replace (not push): one Shop URL so product → Back restores this filtered
  // view without a history entry per refinement.
  const applyState = useCallback(
    (next: ShopBrowseState) => {
      const query = buildShopBrowseQuery(next);
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  const handleChange = useCallback(
    (patch: Partial<ShopBrowseState>) => applyState({ ...state, ...patch }),
    [applyState, state],
  );

  const handleReset = useCallback(
    () => applyState({ sort: 'relevance', gender: state.gender }),
    [applyState, state.gender],
  );

  const {
    data,
    isLoading,
    isError,
    isFetching,
    isPlaceholderData,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCatalogInfinite(filters);

  const swapping =
    isPlaceholderData || (isFetching && !isFetchingNextPage && !isLoading);

  const products = data?.pages.flatMap((page) => page.products) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const statusLabel = isLoading
    ? `Henter ${heading.toLowerCase()}`
    : state.sort === 'price_asc'
      ? `Sorterer ${heading.toLowerCase()} etter laveste pris`
      : state.sort === 'price_desc'
        ? `Sorterer ${heading.toLowerCase()} etter høyeste pris`
        : state.onSale
          ? `Finner ${heading.toLowerCase()} på salg`
          : state.colour
            ? `Henter ${heading.toLowerCase()} i valgt farge`
            : state.minPrice != null || state.maxPrice != null
              ? `Finner ${heading.toLowerCase()} i prisklassen din`
              : state.brand
                ? `Henter ${heading.toLowerCase()} fra ${state.brand}`
                : state.merchantId
                  ? `Henter ${heading.toLowerCase()} fra butikken`
                  : `Sammenligner priser på ${heading.toLowerCase()}`;

  const chatHref = buildChatEntryUrl({
    query: `Hjelp meg å finne ${heading.toLowerCase()}`,
    entryId: `shop-${category.slug}${state.sub ? `-${state.sub}` : ''}`,
  });

  return (
    <>
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
            {isLoading ? (
              <span>Laster produkter …</span>
            ) : (
              <span>
                {total.toLocaleString('nb-NO')}{' '}
                {total === 1 ? 'produkt' : 'produkter'}
              </span>
            )}
            <Link href={chatHref} className="shop-browse__chat-link">
              Spør CLEA om {heading.toLowerCase()}
            </Link>
          </div>
          <ShopFilterDrawer
            category={category}
            state={state}
            stores={stores}
            brands={brands}
            onChange={handleChange}
            onReset={handleReset}
          />
        </div>
      </div>

      <ShopBrowseStatus visible={swapping || isLoading} label={statusLabel} />

      <div
        className={cn(
          'section-container swap-fade pb-16',
          swapping && 'swap-fade--pending',
        )}
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
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="aspect-3/4 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
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
              products={products}
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
      </div>
    </>
  );
}

export function ShopBrowseClient(props: ShopBrowseClientProps) {
  return (
    <Suspense fallback={null}>
      <ShopBrowseContent {...props} />
    </Suspense>
  );
}
