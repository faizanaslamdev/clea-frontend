'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ProductGrid } from '@/components/product-grid';
import { FilterSidebar } from '@/components/filter-sidebar';
import {
  getAllProducts,
  searchProducts,
  filterByPriceRange,
  filterByRating,
  sortProducts,
} from '@/lib/services';
import type { FilterOptions } from '@/components/filter-sidebar';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [filters, setFilters] = useState<FilterOptions>({});

  const filteredProducts = useMemo(() => {
    let results = query ? searchProducts(query).map((r) => r.product) : getAllProducts();

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

  const handleReset = () => {
    setFilters({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
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
            onReset={handleReset}
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 h-20 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-8 lg:grid-cols-4">
        <div className="hidden h-96 animate-pulse rounded-lg bg-muted lg:block" />
        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <Suspense fallback={<SearchPageFallback />}>
          <SearchPageContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
