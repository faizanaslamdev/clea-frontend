'use client';

import { Suspense, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PageLayout } from '@/components/layout/page-layout';
import { ShopCategoryTabs } from '@/components/shop/shop-category-tabs';
import { ShopProductSection } from '@/components/shop/shop-product-section';
import { CATEGORY_GRID_ENTRIES } from '@/lib/constants/category-grid';
import type { ProductFamily } from '@/lib/api/chat-types';

const VALID_FAMILIES = new Set(
  CATEGORY_GRID_ENTRIES.map((entry) => entry.family),
);

function isProductFamily(value: string | null): value is ProductFamily {
  return !!value && VALID_FAMILIES.has(value as ProductFamily);
}

function ShopPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get('category');
  const activeFamily = isProductFamily(categoryParam) ? categoryParam : null;

  const handleSelect = useCallback(
    (family: ProductFamily | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (family) {
        params.set('category', family);
      } else {
        params.delete('category');
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="section-container section-shell">
      <header className="mb-8 flex flex-col gap-2 md:mb-10">
        <h1 className="type-heading">Handle</h1>
        <p className="type-subheading max-w-[560px]">
          Bla gjennom hele utvalget kategori for kategori, på tvers av alle
          våre partnerbutikker.
        </p>
      </header>

      <ShopCategoryTabs
        active={activeFamily}
        onSelect={handleSelect}
        className="mb-10"
      />

      <ShopProductSection family={activeFamily} />
    </div>
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
