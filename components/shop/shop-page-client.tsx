'use client';

import {
  Suspense,
  startTransition,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CategorySection } from '@/components/category-section';
import { cn } from '@/lib/utils';
import { useCategoryPreviews, useTrendingLooks } from '@/lib/hooks/useProducts';
import { useShopReadyNavigation } from '@/lib/hooks/useShopReadyNavigation';
import { ShopBrowseAssistant, ShopBrowseAssistantScope } from '@/components/shop/shop-browse-assistant';
import { ShopCategoryTabs } from '@/components/shop/shop-category-tabs';
import { ShopGenderToggle } from '@/components/shop/shop-gender-toggle';
import { ShopTrendingSection } from '@/components/shop/shop-trending-section';
import {
  fetchCategoryPreviews,
  fetchTrendingLooks,
} from '@/lib/api/products';
import type { SuitableFor } from '@/lib/api/chat-types';
import { categoryGridForShop } from '@/lib/constants/category-grid';
import { productKeys } from '@/lib/query/keys';
import {
  parseShopGenderParam,
  shopCategoryFor,
  shopGenderParamFor,
} from '@/lib/shop/shop-gender';

function ShopPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { isNavigating, error, navigateToShopHref, retry } =
    useShopReadyNavigation();

  const urlGender = parseShopGenderParam(searchParams.get('gender'));
  // Optimistic local gender — update the toggle immediately; URL syncs after.
  const [suitableFor, setSuitableFor] = useState<SuitableFor>(urlGender);
  const shopCategory = shopCategoryFor(suitableFor);
  // Same queries CategorySection/ShopTrendingSection run — React Query dedupes
  // by key, so this only reads their state. Both keep previous data, so the
  // tiles stay on screen (blurred) until the new audience lands; a cached
  // toggle resolves instantly and never blurs.
  const previews = useCategoryPreviews(suitableFor);
  const trending = useTrendingLooks(suitableFor, 3);
  // Only blur while showing previous audience data — not on background refetch.
  const audienceSwapping =
    previews.isPlaceholderData || trending.isPlaceholderData;
  const surfacePending = audienceSwapping || isNavigating;

  useEffect(() => {
    setSuitableFor(urlGender);
  }, [urlGender]);

  // Warm the opposite audience in the background (covers cold client cache).
  useEffect(() => {
    for (const audience of ['female', 'male'] as const) {
      const entries = categoryGridForShop(audience);
      void queryClient.prefetchQuery({
        queryKey: productKeys.categoryGrid(audience),
        queryFn: () => fetchCategoryPreviews(entries, audience),
      });
      void queryClient.prefetchQuery({
        queryKey: productKeys.trending(audience),
        queryFn: () => fetchTrendingLooks(audience, 3),
      });
    }
  }, [queryClient]);

  const handleGenderSelect = useCallback(
    (value: SuitableFor) => {
      if (value === suitableFor || isNavigating) return;
      setSuitableFor(value);
      const params = new URLSearchParams(searchParams.toString());
      params.set('gender', shopGenderParamFor(value));
      const href = `${pathname}?${params.toString()}`;
      startTransition(() => {
        router.replace(href, { scroll: false });
      });
    },
    [isNavigating, pathname, router, searchParams, suitableFor],
  );

  const handleBrowseNavigate = useCallback(
    (href: string) => {
      void navigateToShopHref(href);
    },
    [navigateToShopHref],
  );

  return (
    <ShopBrowseAssistantScope>
      <div
        className={cn(
          'swap-fade',
          surfacePending && 'swap-fade--pending',
          isNavigating && 'swap-fade--pending-interactive',
        )}
        aria-busy={surfacePending || undefined}
      >
        <div className="section-container pt-16">
          <header className="mb-6 flex flex-col gap-2 md:mb-8">
            <h1 className="type-heading">Handle</h1>
            <p className="type-subheading max-w-[560px]">
              Bla gjennom hele utvalget kategori for kategori, på tvers av alle
              våre partnerbutikker.
            </p>
          </header>

          <ShopGenderToggle
            active={suitableFor}
            onSelect={handleGenderSelect}
            className="mb-6 md:mb-8"
          />

          <ShopCategoryTabs
            suitableFor={suitableFor}
            onNavigate={handleBrowseNavigate}
          />
        </div>

        <CategorySection
          compact
          browseLinks
          layout="grid"
          showLink={false}
          suitableFor={suitableFor}
          shopCategory={shopCategory}
          onBrowseNavigate={handleBrowseNavigate}
        />

        <ShopTrendingSection
          suitableFor={suitableFor}
          shopCategory={shopCategory}
        />
      </div>

      {error ? (
        <div className="section-container pb-6">
          <p className="shop-browse__state text-sm text-muted-foreground" role="alert">
            Kunne ikke åpne utvalget.{' '}
            <button
              type="button"
              className="shop-filter-reset"
              onClick={retry}
            >
              Prøv igjen
            </button>
          </p>
        </div>
      ) : null}

      <ShopBrowseAssistant
        heading={suitableFor === 'male' ? 'herreklær' : 'dameklær'}
        shopCategory={shopCategory}
        entryKey={`shop-hub-${shopGenderParamFor(suitableFor)}`}
      />
    </ShopBrowseAssistantScope>
  );
}

export function ShopPageClient() {
  return (
    <Suspense fallback={null}>
      <ShopPageContent />
    </Suspense>
  );
}
