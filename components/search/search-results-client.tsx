'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppPathname } from '@/lib/navigation/app-pathname';
import { Sparkles } from 'lucide-react';
import { HeroSearchForm } from '@/components/hero-search-form';
import { ProductGrid } from '@/components/product-grid';
import { LoadMoreButton } from '@/components/shared/load-more-button';
import { SEARCH_FILTER_CAPABILITIES, ShopFilterDrawer } from '@/components/shop/shop-filter-drawer';
import { navigateToChatEntry } from '@/lib/chat/chat-entry';
import { useSearchInfinite } from '@/lib/hooks/useSearchInfinite';
import {
  buildSearchPageQuery,
  emptySearchFilters,
  parseSearchPageState,
  searchParamsFor,
} from '@/lib/search/search-page-params';
import { buildSearchUrl, shouldOpenChat } from '@/lib/search/search-routing';
import { relaxationNotices, understoodChips } from '@/lib/search/search-summary';
import type { ShopBrowseState } from '@/lib/shop/shop-browse-params';
import type { Store } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SearchResultsClientProps {
  stores: readonly Store[];
}

function SearchResultsContent({ stores }: SearchResultsClientProps) {
  const router = useRouter();
  const pathname = useAppPathname();
  const searchParams = useSearchParams();
  const state = useMemo(
    () => parseSearchPageState(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const params = useMemo(() => searchParamsFor(state), [state]);
  const [draft, setDraft] = useState<string | null>(null);
  const query = draft ?? state.q;

  const storeName = useMemo(() => {
    const names = new Map(stores.map((store) => [store.id, store.name]));
    return (id: string) => names.get(id) ?? id;
  }, [stores]);

  // Filters replace (one history entry per search); a new query pushes.
  const applyFilters = useCallback(
    (filters: ShopBrowseState) => {
      window.history.replaceState(null, '', `${pathname}?${buildSearchPageQuery({ ...state, filters })}`);
    },
    [pathname, state],
  );
  const handleChange = useCallback(
    (patch: Partial<ShopBrowseState>) => applyFilters({ ...state.filters, ...patch }),
    [applyFilters, state.filters],
  );
  const handleReset = useCallback(() => applyFilters(emptySearchFilters()), [applyFilters]);

  const shopCategory = state.audienceHint === 'male' ? 'mens' : state.audienceHint === 'female' ? 'womens' : undefined;
  const askClea = useCallback(
    (text: string) => navigateToChatEntry(router, { query: text, shopCategory }),
    [router, shopCategory],
  );
  const submitQuery = useCallback(
    (text: string) => {
      setDraft(null);
      if (shouldOpenChat(text)) {
        askClea(text);
        return;
      }
      router.push(buildSearchUrl(text, shopCategory));
    },
    [askClea, router, shopCategory],
  );

  const { data, isLoading, isError, isPlaceholderData, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearchInfinite(params);

  const first = data?.pages[0];
  const products = data?.pages.flatMap((page) => page.products) ?? [];
  const pending = isPlaceholderData;
  const showSkeleton = isLoading && products.length === 0;

  const chips = first ? understoodChips(first.understood, storeName) : [];
  const notices = first
    ? relaxationNotices(first.relaxed, first.requested, state.audienceHint != null)
    : [];
  const drawerFiltered =
    state.filters.merchantIds.length > 0 ||
    state.filters.brands.length > 0 ||
    state.filters.colours.length > 0 ||
    state.filters.onSale ||
    state.filters.minPrice != null ||
    state.filters.maxPrice != null;

  return (
    <div className="section-container pt-8">
      <header className="search-results__header">
        <HeroSearchForm
          variant="compact"
          idPrefix="search-results"
          value={query}
          onValueChange={setDraft}
          onSubmitQuery={submitQuery}
          submitRequiresText
          placeholder="Søk etter produkter, merker eller butikker"
          className="search-results__box"
        />
        {state.q ? (
          <h1 className="type-heading shop-browse__title search-results__title">
            Resultater for «{state.q}»
          </h1>
        ) : (
          <h1 className="type-heading shop-browse__title search-results__title">Søk</h1>
        )}
        {chips.length > 0 && (
          <p className="search-results__understood" aria-label="Slik forsto vi søket">
            <span className="search-results__understood-label">Viser</span>
            {chips.map((chip) => (
              <span key={chip} className="search-results__chip">
                {chip}
              </span>
            ))}
          </p>
        )}
        {notices.length > 0 && (
          <ul className="search-results__notices" role="status">
            {notices.map((notice) => (
              <li key={notice}>{notice}</li>
            ))}
          </ul>
        )}
        {first?.includedUnlabelledAudience && (
          <p className="search-results__hint">Inkluderer også produkter uten kjønnsmerking fra butikken.</p>
        )}
      </header>

      {state.q && (
        <div className="shop-browse__toolbar">
          <div className="shop-browse__meta">
            {showSkeleton ? (
              <span>Søker …</span>
            ) : pending ? (
              <span>Oppdaterer …</span>
            ) : first ? (
              <span>
                {first.total.toLocaleString('nb-NO')} {first.total === 1 ? 'produkt' : 'produkter'}
              </span>
            ) : null}
            <button type="button" className="search-results__ask" onClick={() => askClea(state.q)}>
              <Sparkles className="size-4" aria-hidden="true" />
              Spør Clea om dette
            </button>
          </div>
          <ShopFilterDrawer
            capabilities={SEARCH_FILTER_CAPABILITIES}
            state={state.filters}
            stores={stores}
            facets={first?.facets}
            facetsPending={pending}
            onChange={handleChange}
            onReset={handleReset}
          />
        </div>
      )}

      <div className={cn('shop-browse__grid swap-fade', pending && 'swap-fade--pending')} aria-busy={pending || showSkeleton}>
        {!state.q ? (
          <div className="shop-browse__state">
            <p>Skriv hva du leter etter – for eksempel «svarte jeans herre» eller «ryggsekk under 800 kr».</p>
          </div>
        ) : isError ? (
          <div className="shop-browse__state">
            <p>Kunne ikke hente resultater. Prøv igjen.</p>
            <button type="button" className="shop-filter-reset" onClick={() => void refetch()}>
              Prøv igjen
            </button>
          </div>
        ) : showSkeleton ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="aspect-3/4 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="shop-browse__state">
            <p>
              Ingen produkter matchet «{state.q}»{drawerFiltered ? ' med filtrene du har valgt' : ''}.
            </p>
            <div className="flex flex-wrap gap-3">
              {drawerFiltered && (
                <button type="button" className="shop-filter-reset" onClick={handleReset}>
                  Nullstill filtre
                </button>
              )}
              <button type="button" className="shop-filter-reset" onClick={() => askClea(state.q)}>
                Spør Clea i stedet
              </button>
            </div>
          </div>
        ) : (
          <>
            <ProductGrid products={products} showMerchantLabel enableAnchorActions />
            {hasNextPage && <LoadMoreButton onClick={() => void fetchNextPage()} loading={isFetchingNextPage} />}
          </>
        )}
      </div>
    </div>
  );
}

export function SearchResultsClient(props: SearchResultsClientProps) {
  return (
    <Suspense fallback={null}>
      <SearchResultsContent {...props} />
    </Suspense>
  );
}
