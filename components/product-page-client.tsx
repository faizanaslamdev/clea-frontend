'use client';

import { useEffect, useMemo, useState } from 'react';
import { Product } from '@/lib/types';
import { ProductDetails } from '@/components/product-details';
import { ProductGrid } from '@/components/product-grid';
import { PriceChart } from '@/components/price-chart';
import { PriceAIInsightsPanel } from '@/components/price-ai-insights';
import { getAllStores, getLowestPriceStore, getSimilarProducts } from '@/lib/services';

interface ProductPageClientProps {
  product: Product;
}

export function ProductPageClient({ product }: ProductPageClientProps) {
  const stores = getAllStores();
  const defaultStoreId = useMemo(() => {
    const best = getLowestPriceStore(product);
    return best?.store.id ?? stores[0]?.id ?? null;
  }, [product, stores]);

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedStoreId(defaultStoreId);
  }, [product.id, defaultStoreId]);

  const similarProducts = getSimilarProducts(product.id);

  return (
    <>
      <section className="border-b border-border py-8 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductDetails
            product={product}
            selectedStoreId={selectedStoreId}
            onSelectStore={setSelectedStoreId}
          />
        </div>
      </section>

      <section className="border-b border-border py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PriceAIInsightsPanel product={product} />
        </div>
      </section>

      <section className="border-b border-border py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PriceChart product={product} />
        </div>
      </section>

      {similarProducts.length > 0 && (
        <section className="py-12 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground">Similar Products</h2>
              <p className="mt-2 text-lg text-muted-foreground">
                Other {product.category.toLowerCase()} items you might like
              </p>
            </div>
            <ProductGrid products={similarProducts} />
          </div>
        </section>
      )}
    </>
  );
}
