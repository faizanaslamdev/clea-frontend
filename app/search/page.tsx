'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FilterSidebar, type FilterOptions } from '@/components/filter-sidebar';
import { PageLayout } from '@/components/layout/page-layout';
import { ProductGrid } from '@/components/product-grid';
import { LoadingBlock } from '@/components/shared/loading-block';
import {
  filterByPriceRange,
  filterByRating,
  getAllProducts,
  searchProducts,
  sortProducts,
} from '@/lib/services';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [filters, setFilters] = useState<FilterOptions>({});

  const filteredProducts = useMemo(() => {
    let results = query
      ? searchProducts(query).map((r) => r.product)
      : getAllProducts();

    if (filters.category) {
      results = results.filter((p) => p.category === filters.category);
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      results = filterByPriceRange(
        results,
        filters.priceMin ?? 0,
        filters.priceMax ?? 100000
      );
    }

    if (filters.rating) {
      results = filterByRating(results, filters.rating);
    }

    if (filters.sortBy) {
      results = sortProducts(results, filters.sortBy);
    }

    return results;
  }, [query, filters]);

  return (
    <div className="section-container section-shell">
      <div className="mb-12">
        {query ? (
          <h1 className="text-4xl font-bold text-foreground">
            Search Results for{' '}
            <span className="text-primary">&quot;{query}&quot;</span>
          </h1>
        ) : (
          <h1 className="text-4xl font-bold text-foreground">All Products</h1>
        )}
        <p className="mt-2 text-lg text-muted-foreground">
          {filteredProducts.length} products found
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="hidden lg:block">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters({})}
          />
        </aside>

        <div className="lg:col-span-3">
          <ProductGrid
            products={filteredProducts}
            emptyMessage={
              query
                ? `No products found for "${query}"`
                : 'No products available'
            }
          />
        </div>
      </div>
    </div>
  );
}

function SearchPageFallback() {
  return (
    <div className="section-container section-shell">
      <LoadingBlock className="mb-12 h-20" />
      <div className="grid gap-8 lg:grid-cols-4">
        <LoadingBlock className="hidden h-96 lg:block" />
        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingBlock key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <PageLayout>
      <Suspense fallback={<SearchPageFallback />}>
        <SearchPageContent />
      </Suspense>
    </PageLayout>
  );
}
