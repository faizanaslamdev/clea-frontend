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

  const urlGender = parseShopGenderParam(searchParams.get('gender'));
  // Optimistic local gender — update the toggle immediately; URL syncs after.
  const [suitableFor, setSuitableFor] = useState<SuitableFor>(urlGender);
  const shopCategory = shopCategoryFor(suitableFor);

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
      if (value === suitableFor) return;
      setSuitableFor(value);
      const params = new URLSearchParams(searchParams.toString());
      params.set('gender', shopGenderParamFor(value));
      const href = `${pathname}?${params.toString()}`;
      startTransition(() => {
        router.replace(href, { scroll: false });
      });
    },
    [pathname, router, searchParams, suitableFor],
  );

  return (
    <>
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
          shopCategory={shopCategory}
        />
      </div>

      <CategorySection
        compact
        layout="grid"
        showLink={false}
        suitableFor={suitableFor}
        shopCategory={shopCategory}
      />

      <ShopTrendingSection suitableFor={suitableFor} shopCategory={shopCategory} />
    </>
  );
}

export function ShopPageClient() {
  return (
    <Suspense fallback={null}>
      <ShopPageContent />
    </Suspense>
  );
}
