'use client';

import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import {
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Product } from '@/lib/types';
import { formatPrice, getLowestPriceStore } from '@/lib/services';
import { fetchProductById } from '@/lib/api/products';
import { STALE_TIME_STATIC_MS } from '@/lib/query/client';
import { productKeys } from '@/lib/query/keys';
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
  onAnchorActionComplete?: () => void;
}

const TRENDING_CARD_IMAGE_SIZES =
  '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

const DETAILED_CARD_IMAGE_SIZES =
  '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

function ProductCardClickTarget({
  className,
  onClick,
  onMouseEnter,
  onFocus,
  children,
}: {
  className?: string;
  onClick: () => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  children: ReactNode;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={className}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
    >
      {children}
    </div>
  );
}

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

function usePrefetchProductDetail() {
  const queryClient = useQueryClient();

  return (productId: string) => {
    void queryClient.prefetchQuery({
      queryKey: productKeys.detail(productId),
      queryFn: () => fetchProductById(productId),
      staleTime: STALE_TIME_STATIC_MS,
    });
  };
}

export function ProductCard({
  product,
  storeId,
  variant = 'detailed',
  imageSizes,
  enableAnchorActions = false,
  onAnchorActionComplete,
}: ProductCardProps) {
  const { openProduct } = useProductModal();
  const chatAnchor = useChatAnchorConnection();
  const prefetchProductDetail = usePrefetchProductDetail();
  const price = useListingPrice(product, storeId);
  const showAnchorMenu = enableAnchorActions;

  const prefetchThisProduct = () => {
    prefetchProductDetail(product.id);
  };

  const openDetails = () => {
    chatAnchor?.setActiveProductId(product.id);
    openProduct(product.id, storeId);
  };

  if (variant === 'trending') {
    return (
      <ProductCardClickTarget
        className="trending-product-card group"
        onClick={openDetails}
        onMouseEnter={prefetchThisProduct}
        onFocus={prefetchThisProduct}
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
      </ProductCardClickTarget>
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
          <ProductCardClickTarget
            className="product-card-detailed__image-hit"
            onClick={openDetails}
            onMouseEnter={prefetchThisProduct}
            onFocus={prefetchThisProduct}
          >
            <ProductCardImage
              product={product}
              sizes={imageSizes ?? DETAILED_CARD_IMAGE_SIZES}
            />
          </ProductCardClickTarget>
          {showAnchorMenu ? (
            <ProductCardAnchorMenu
              product={product}
              disabled={chatAnchor?.isAnchorLoading ?? false}
              onActionComplete={onAnchorActionComplete}
            />
          ) : null}
        </div>

        <ProductCardClickTarget
          className="product-card-detailed__body"
          onClick={openDetails}
          onMouseEnter={prefetchThisProduct}
          onFocus={prefetchThisProduct}
        >
          <p className="product-card-detailed__brand">{product.brand}</p>
          <h3 className="product-card-detailed__title" title={product.name}>
            {product.name}
          </h3>
          {price != null && (
            <p className="product-card-detailed__price">
              {formatPrice(price, product.currency)}
            </p>
          )}
          <p className="product-card-detailed__shop">
            Handle hos {product.brand}
          </p>
        </ProductCardClickTarget>
      </div>
    </div>
  );
}
