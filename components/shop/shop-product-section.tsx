'use client';

import { ProductGrid } from '@/components/product-grid';
import { LoadMoreButton } from '@/components/shared/load-more-button';
import { useCatalogInfinite } from '@/lib/hooks/useCatalogInfinite';
import type { ProductFamily, SuitableFor } from '@/lib/api/chat-types';

interface ShopProductSectionProps {
  family: ProductFamily | null;
  suitableFor?: SuitableFor;
}

export function ShopProductSection({ family, suitableFor }: ShopProductSectionProps) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCatalogInfinite({
    productFamily: family ?? undefined,
    suitableFor,
    balanceMerchants: true,
  });

  const products = data?.pages.flatMap((page) => page.products) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const loaded = products.length;

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4"
        aria-hidden
      >
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="aspect-3/4 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-muted-foreground">
        Kunne ikke laste produkter. Prøv igjen senere.
      </p>
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-muted-foreground" role="status">
        {total === 0
          ? 'Ingen produkter funnet i denne kategorien ennå'
          : loaded < total
            ? `Viser ${loaded} av ${total} produkter`
            : `${total} produkter tilgjengelig`}
      </p>

      <ProductGrid
        products={products}
        emptyMessage="Ingen produkter funnet i denne kategorien ennå."
        showMerchantLabel
      />

      {hasNextPage ? (
        <LoadMoreButton
          onClick={() => fetchNextPage()}
          loading={isFetchingNextPage}
        />
      ) : null}
    </>
  );
}
