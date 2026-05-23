'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatPrice, getLowestPriceStore } from '@/lib/services';
import { Card } from '@/components/ui/card';
// import { TrendingBadge } from '@/components/trending-badge';
import { LowestPriceBadge } from '@/components/lowest-price-badge';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const lowestPrice = getLowestPriceStore(product);

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group cursor-pointer gap-0 overflow-hidden p-0 py-0 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          {/* {product.trending && (
            <TrendingBadge variant="overlay" className="absolute right-3 top-3" />
          )} */}
          {product.savingsPercent > 0 && (
            <span className="absolute left-3 top-3 inline-flex rounded-md bg-white/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-foreground shadow-sm backdrop-blur-sm">
              −{product.savingsPercent}%
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {!compact && (
            <p className="mb-1 text-xs text-muted-foreground">{product.brand}</p>
          )}

          <h3 className="mb-2 line-clamp-2 font-semibold text-foreground">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="mb-3 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-foreground">
                {product.rating}
              </span>
              <span className="text-xs text-muted-foreground">★</span>
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Pricing */}
          {lowestPrice && (
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">
                {formatPrice(lowestPrice.price)}
              </span>
              {product.averagePrice > lowestPrice.price && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.averagePrice)}
                </span>
              )}
            </div>
          )}

          {/* Store Info */}
          {lowestPrice && !compact && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <LowestPriceBadge variant="mini" />
              <p className="text-xs text-muted-foreground">
                at <span className="font-medium text-foreground">{lowestPrice.store.name}</span>
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
