'use client';

import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ProductCard } from './product-card';

interface ProductGridProps {
  products: Product[];
  storeId?: string;
  loading?: boolean;
  emptyMessage?: string;
  variant?: 'default' | 'trending';
}

export function ProductGrid({
  products,
  storeId,
  loading = false,
  emptyMessage = 'No products found',
  variant = 'trending',
}: ProductGridProps) {
  const isTrending = variant === 'trending';

  if (loading) {
    return (
      <div
        className={cn(
          'grid',
          isTrending
            ? 'grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4'
            : 'gap-6 sm:grid-cols-2 lg:grid-cols-3',
        )}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'animate-pulse bg-muted',
              isTrending ? 'aspect-[2/3] w-full rounded-xl' : 'h-80 rounded-lg',
            )}
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-center text-muted-foreground text-lg">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid',
        isTrending
          ? 'grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4'
          : 'gap-6 sm:grid-cols-2 lg:grid-cols-3',
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          storeId={storeId}
          variant={variant}
        />
      ))}
    </div>
  );
}
