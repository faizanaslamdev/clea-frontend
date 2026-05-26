'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import {
  formatPrice,
  getLowestPriceStore,
  getProductHrefFromProduct,
} from '@/lib/services';
import { Card } from '@/components/ui/card';
import { LowestPriceBadge } from '@/components/lowest-price-badge';

interface ProductCardProps {
  product: Product;
  storeId?: string;
  compact?: boolean;
  variant?: 'default' | 'trending';
  imageSizes?: string;
}

const TRENDING_CARD_IMAGE_SIZES =
  '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

export function ProductCard({
  product,
  storeId,
  compact = false,
  variant = 'trending',
  imageSizes = TRENDING_CARD_IMAGE_SIZES,
}: ProductCardProps) {
  const lowestPrice = getLowestPriceStore(product);
  const href = getProductHrefFromProduct(product, storeId);

  if (variant === 'trending') {
    return (
      <Link href={href} className="trending-product-card group">
        <div className="trending-product-card__image-wrap">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes={imageSizes}
          />
        </div>

        <p className="trending-product-card__brand">{product.brand}</p>
        {lowestPrice && (
          <p className="trending-product-card__price">
            {formatPrice(lowestPrice.price)}
          </p>
        )}
      </Link>
    );
  }

  return (
    <Link href={href}>
      <Card className="group cursor-pointer gap-0 overflow-hidden p-0 py-0 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
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
          {product.savingsPercent > 0 && (
            <span className="absolute left-3 top-3 inline-flex rounded-md bg-white/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-foreground shadow-sm backdrop-blur-sm">
              −{product.savingsPercent}%
            </span>
          )}
        </div>

        <div className="p-4">
          {!compact && (
            <p className="mb-1 text-xs text-muted-foreground">{product.brand}</p>
          )}

          <h3 className="mb-2 line-clamp-2 font-semibold text-foreground">
            {product.name}
          </h3>

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

          {lowestPrice && !compact && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <LowestPriceBadge variant="mini" />
              <p className="text-xs text-muted-foreground">
                at{' '}
                <span className="font-medium text-foreground">
                  {lowestPrice.store.name}
                </span>
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
