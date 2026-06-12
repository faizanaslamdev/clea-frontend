'use client';

import Image from 'next/image';
import { Product } from '@/lib/types';
import { formatPrice, getLowestPriceStore } from '@/lib/services';
import { useChatAnchorConnection } from '@/components/chat/chat-anchor-provider';
import { useProductModal } from '@/components/product/product-modal-provider';
import { ProductCardAnchorMenu } from '@/components/product/product-card-anchor-menu';
import { cn } from '@/lib/utils';

export type ProductCardVariant = 'trending' | 'detailed';

interface ProductCardProps {
  product: Product;
  storeId?: string;
  variant?: ProductCardVariant;
  imageSizes?: string;
  enableAnchorActions?: boolean;
}

const TRENDING_CARD_IMAGE_SIZES =
  '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

const DETAILED_CARD_IMAGE_SIZES =
  '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

function ProductCardImage({
  product,
  sizes,
}: {
  product: Product;
  sizes: string;
}) {
  return (
    <div className="product-card__image-wrap">
      <Image
        src={product.image}
        alt={product.name}
        fill
        className="product-card__image"
        sizes={sizes}
        unoptimized
      />
    </div>
  );
}

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
  enableAnchorActions = false,
}: ProductCardProps) {
  const { openProduct } = useProductModal();
  const chatAnchor = useChatAnchorConnection();
  const price = useListingPrice(product, storeId);
  const showAnchorMenu = enableAnchorActions;

  const openDetails = () => {
    chatAnchor?.setActiveProductId(product.id);
    openProduct(product.id, storeId);
  };

  if (variant === 'trending') {
    return (
      <button
        type="button"
        className="trending-product-card group"
        onClick={openDetails}
      >
        <ProductCardImage
          product={product}
          sizes={imageSizes ?? TRENDING_CARD_IMAGE_SIZES}
        />

        <div className="trending-product-card__meta">
          <p className="trending-product-card__brand">{product.brand}</p>
          {price != null && (
            <p className="trending-product-card__price">
              {formatPrice(price, product.currency)}
            </p>
          )}
        </div>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'product-card-detailed-wrap group',
        showAnchorMenu && 'product-card-detailed-wrap--anchorable',
      )}
    >
      <div className="product-card-detailed">
        <div className="product-card-detailed__media">
          <button
            type="button"
            className="product-card-detailed__image-hit"
            onClick={openDetails}
          >
            <ProductCardImage
              product={product}
              sizes={imageSizes ?? DETAILED_CARD_IMAGE_SIZES}
            />
          </button>
          {showAnchorMenu ? (
            <ProductCardAnchorMenu
              product={product}
              disabled={chatAnchor?.isAnchorLoading ?? false}
            />
          ) : null}
        </div>

        <button
          type="button"
          className="product-card-detailed__body"
          onClick={openDetails}
        >
          <p className="product-card-detailed__brand">{product.brand}</p>
          <h3 className="product-card-detailed__title">{product.name}</h3>
          {price != null && (
            <p className="product-card-detailed__price">
              {formatPrice(price, product.currency)}
            </p>
          )}
          <p className="product-card-detailed__shop">
            Handle hos {product.brand}
          </p>
        </button>
      </div>
    </div>
  );
}
