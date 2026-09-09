'use client';

import { Suspense, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PageLayout } from '@/components/layout/page-layout';
import { CategorySection } from '@/components/category-section';
import { ShopCategoryTabs } from '@/components/shop/shop-category-tabs';
import { ShopGenderToggle } from '@/components/shop/shop-gender-toggle';
import { ShopTrendingSection } from '@/components/shop/shop-trending-section';
import type { ShopCategory, SuitableFor } from '@/lib/api/chat-types';

/** `gender` URL param <-> the backend's `suitable_for` filter -- kept as
 * its own short param (not `suitable_for` verbatim) so the URL reads in
 * Norwegian. Always resolves to a value (defaults to "dame") since the
 * toggle itself is binary, same as daydream.ing's own Womens/Mens. */
function parseGenderParam(value: string | null): SuitableFor {
  return value === 'herre' ? 'male' : 'female';
}

function genderParamFor(value: SuitableFor): string {
  return value === 'male' ? 'herre' : 'dame';
}

function shopCategoryFor(value: SuitableFor): ShopCategory {
  return value === 'male' ? 'mens' : 'womens';
}

function ShopPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const suitableFor = parseGenderParam(searchParams.get('gender'));
  const shopCategory = shopCategoryFor(suitableFor);

  const handleGenderSelect = useCallback(
    (value: SuitableFor) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('gender', genderParamFor(value));
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

        <ShopCategoryTabs shopCategory={shopCategory} />
      </div>

      <CategorySection
        compact
        showLink={false}
        suitableFor={suitableFor}
        shopCategory={shopCategory}
      />

      <ShopTrendingSection suitableFor={suitableFor} shopCategory={shopCategory} />
    </>
  );
}

export default function ShopPage() {
  return (
    <PageLayout>
      <Suspense fallback={null}>
        <ShopPageContent />
      </Suspense>
    </PageLayout>
  );
}
