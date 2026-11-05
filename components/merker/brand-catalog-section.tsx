'use client';

import { ProductGrid } from '@/components/product-grid';
import { LoadMoreButton } from '@/components/shared/load-more-button';
import { useCatalogInfinite } from '@/lib/hooks/useCatalogInfinite';

interface BrandCatalogSectionProps {
  /** Catalogue brand value, e.g. "fjällräven". */
  brand: string;
  brandName: string;
}

/** Products of one brand from every store, server-prefetched on the brand page. */
export function BrandCatalogSection({ brand, brandName }: BrandCatalogSectionProps) {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useCatalogInfinite({ brand, segment: 'all' });

  const products = data?.pages.flatMap((page) => page.products) ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
      <ProductGrid
        products={products}
        showMerchantLabel
        emptyMessage={`Ingen produkter fra ${brandName} akkurat nå.`}
      />
      {hasNextPage ? (
        <LoadMoreButton onClick={() => fetchNextPage()} loading={isFetchingNextPage} />
      ) : null}
    </>
  );
}
