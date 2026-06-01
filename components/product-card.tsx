'use client';

import Image from 'next/image';
import { Product } from '@/lib/types';
import { formatPrice, getLowestPriceStore } from '@/lib/services';
import { useProductModal } from '@/components/product/product-modal-provider';

export type ProductCardVariant = 'trending' | 'detailed';

interface ProductCardProps {
  product: Product;
  storeId?: string;
  variant?: ProductCardVariant;
  imageSizes?: string;
}

const TRENDING_CARD_IMAGE_SIZES =
  '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

const DETAILED_CARD_IMAGE_SIZES =
  '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

function useListingPrice(product: Product, storeId?: string) {
  const lowest = getLowestPriceStore(product);
  if (storeId && product.prices[storeId] != null) {
    return product.prices[storeId];
  }
  return lowest?.price;
}

export function ProductCard({
  product,
  storeId,
  variant = 'detailed',
  imageSizes,
}: ProductCardProps) {
  const { openProduct } = useProductModal();
  const price = useListingPrice(product, storeId);

  const openDetails = () => openProduct(product.id, storeId);

  if (variant === 'trending') {
    return (
      <button
        type="button"
        className="trending-product-card group"
        onClick={openDetails}
      >
        <div className="trending-product-card__image-wrap">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes={imageSizes ?? TRENDING_CARD_IMAGE_SIZES}
          />
        </div>

        <p className="trending-product-card__brand">{product.brand}</p>
        {price != null && (
          <p className="trending-product-card__price">{formatPrice(price)}</p>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="product-card-detailed group"
      onClick={openDetails}
    >
      <div className="product-card-detailed__image-wrap">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes={imageSizes ?? DETAILED_CARD_IMAGE_SIZES}
        />
      </div>

      <div className="product-card-detailed__body">
        <p className="product-card-detailed__brand">{product.brand}</p>
        <h3 className="product-card-detailed__title">{product.name}</h3>
        {price != null && (
          <p className="product-card-detailed__price">{formatPrice(price)}</p>
        )}
        <p className="product-card-detailed__shop">
          Handle hos {product.brand}
        </p>
      </div>
    </button>
  );
}
