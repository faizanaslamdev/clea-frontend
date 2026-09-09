'use client';

import { Suspense, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CategorySection } from '@/components/category-section';
import { ShopCategoryTabs } from '@/components/shop/shop-category-tabs';
import { ShopGenderToggle } from '@/components/shop/shop-gender-toggle';
import { ShopTrendingSection } from '@/components/shop/shop-trending-section';
import type { SuitableFor } from '@/lib/api/chat-types';
import {
  parseShopGenderParam,
  shopCategoryFor,
  shopGenderParamFor,
} from '@/lib/shop/shop-gender';

function ShopPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const suitableFor = parseShopGenderParam(searchParams.get('gender'));
  const shopCategory = shopCategoryFor(suitableFor);

  const handleGenderSelect = useCallback(
    (value: SuitableFor) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('gender', shopGenderParamFor(value));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
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
