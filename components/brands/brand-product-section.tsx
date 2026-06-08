'use client';

import { ProductGrid } from '@/components/product-grid';
import { LoadMoreButton } from '@/components/shared/load-more-button';
import { LoadingBlock } from '@/components/shared/loading-block';
import { useCatalogInfinite } from '@/lib/hooks/useCatalogInfinite';

interface BrandProductSectionProps {
  merchantId: string;
  brandName: string;
}

export function BrandProductSection({
  merchantId,
  brandName,
}: BrandProductSectionProps) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCatalogInfinite({ merchantId });

  const products = data?.pages.flatMap((page) => page.products) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const loaded = products.length;

  if (isLoading) {
    return <LoadingBlock className="min-h-[320px]" />;
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
      <div className="mb-10">
        <h1 className="type-heading">{brandName}</h1>
        <p className="type-subheading mt-2">
          {total === 0
            ? `Ingen produkter funnet hos ${brandName} ennå`
            : loaded < total
              ? `Viser ${loaded} av ${total} produkter hos ${brandName}`
              : `${total} produkter tilgjengelig hos ${brandName}`}
        </p>
      </div>

      <ProductGrid
        products={products}
        storeId={merchantId}
        emptyMessage={`Ingen produkter listet for ${brandName} ennå.`}
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
