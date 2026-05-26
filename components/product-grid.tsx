'use client';

import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ProductCard, type ProductCardVariant } from './product-card';

interface ProductGridProps {
  products: Product[];
  storeId?: string;
  loading?: boolean;
  emptyMessage?: string;
  variant?: ProductCardVariant;
}

const GRID_CLASS =
  'grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4';

export function ProductGrid({
  products,
  storeId,
  loading = false,
  emptyMessage = 'No products found',
  variant = 'detailed',
}: ProductGridProps) {
  if (loading) {
    return (
      <div className={GRID_CLASS}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'animate-pulse rounded-xl bg-muted',
              variant === 'trending' ? 'aspect-[2/3]' : 'aspect-[2/3]',
            )}
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-center text-lg text-muted-foreground">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={GRID_CLASS}>
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
