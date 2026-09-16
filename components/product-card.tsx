'use client';

import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { type MouseEvent, type ReactNode, useState } from 'react';
import { Product } from '@/lib/types';
import { formatPrice, getListingPriceStore, toDisplayCase } from '@/lib/services';
import { fetchProductById } from '@/lib/api/products';
import { getProductHref } from '@/lib/domain/products/paths';
import { saveCurrentScrollPosition } from '@/lib/navigation/scroll-restoration';
import { shouldOpenProductDesktopModal } from '@/lib/navigation/product-desktop-modal';
import { STALE_TIME_STATIC_MS } from '@/lib/query/client';
import { productKeys } from '@/lib/query/keys';
import { useChatAnchorConnection } from '@/components/chat/chat-anchor-provider';
import { ProductCardAnchorMenu } from '@/components/product/product-card-anchor-menu';
import { useProductDesktopModal } from '@/components/product/product-desktop-modal-provider';
import { cn } from '@/lib/utils';
import type { EngagementSurface } from '@/lib/api/engagement';
import { useEngagementTracking } from '@/lib/hooks/useEngagementTracking';
import Image from 'next/image';

export type ProductCardVariant = 'trending' | 'detailed';

interface ProductCardProps {
  product: Product;
  storeId?: string;
  variant?: ProductCardVariant;
  imageSizes?: string;
  /** Above-the-fold grid slots only — keep this rare during rapid Shop switches. */
  imagePriority?: boolean;
  enableAnchorActions?: boolean;
  showMerchantLabel?: boolean;
  onAnchorActionComplete?: () => void;
  engagementSurface?: EngagementSurface;
}

const TRENDING_CARD_IMAGE_SIZES =
  '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

const DETAILED_CARD_IMAGE_SIZES =
  '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

function ProductCardLink({
  href,
  className,
  onNavigate,
  onMouseEnter,
  onFocus,
  children,
}: {
  href: string;
  className?: string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      // Save scroll before the browser scrolls the target into view on click
      // (mobile/tablet real-route Back restore). Desktop modal does not navigate.
      onPointerDown={saveCurrentScrollPosition}
      onClick={onNavigate}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      prefetch
    >
      {children}
    </Link>
  );
}

function ProductCardImage({
  product,
  sizes,
  priority = false,
}: {
  product: Product;
  sizes: string;
  priority?: boolean;
}) {
  // Optimizer 500s (upstream timeout under concurrency) or bad merchant URLs
  // must not leave a broken <img> in the grid. Same pattern as TrackImage:
  // drop the failed Image and keep the wrap background.
  const [hasError, setHasError] = useState(false);
  const [unoptimized, setUnoptimized] = useState(false);

  if (hasError) {
    return (
      <div
        className="product-card__image-wrap product-card__image-wrap--fallback"
        aria-hidden
      />
    );
  }

  return (
    <div className="product-card__image-wrap">
      <Image
        key={unoptimized ? 'cdn' : 'optimizer'}
        src={product.image}
        alt={toDisplayCase(product.name)}
        fill
        className="product-card__image"
        sizes={sizes}
        priority={priority}
        unoptimized={unoptimized}
        onError={() => {
          // First failure: bypass /_next/image and try the CDN directly.
          // Second failure: empty wrap (no broken-image icon chrome).
          if (!unoptimized) {
            setUnoptimized(true);
            return;
          }
          setHasError(true);
        }}
      />
    </div>
  );
}

function ProductCardPrice({
  product,
  storeId,
  priceClassName,
}: {
  product: Product;
  storeId?: string;
  priceClassName: string;
}) {
  const listing = getListingPriceStore(product, storeId);
  if (listing == null) return null;

  return (
    <div className="product-card__price-row">
      <p className={priceClassName}>{formatPrice(listing.price, product.currency)}</p>
      {!listing.inStock ? (
        <span className="product-card__stock-badge" role="status">
          Ikke på lager
        </span>
      ) : null}
    </div>
  );
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
  imagePriority = false,
  enableAnchorActions = false,
  showMerchantLabel = false,
  onAnchorActionComplete,
  engagementSurface,
}: ProductCardProps) {
  const chatAnchor = useChatAnchorConnection();
  const { openProductModal } = useProductDesktopModal();
  const prefetchProductDetail = usePrefetchProductDetail();
  const engagement = useEngagementTracking(engagementSurface ?? 'catalog');
  const trackEngagement = engagementSurface ? engagement : null;
  const showAnchorMenu = enableAnchorActions;
  const merchantLabel = product.merchantName?.trim();
  const showMerchantBadge = showMerchantLabel && Boolean(merchantLabel);
  const showBrandEyebrow =
    !showMerchantBadge ||
    (merchantLabel != null &&
      product.brand.trim().toLowerCase() !== merchantLabel.toLowerCase());

  const href = getProductHref(product.id, { storeId });

  const prefetchThisProduct = () => {
    prefetchProductDetail(product.id);
  };

  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    trackEngagement?.trackCardClick(product.id);
    chatAnchor?.setActiveProductId(product.id);

    if (shouldOpenProductDesktopModal()) {
      event.preventDefault();
      openProductModal(product.id, storeId, engagementSurface);
    }
  };

  if (variant === 'trending') {
    return (
      <ProductCardLink
        href={href}
        className="trending-product-card group"
        onNavigate={handleNavigate}
        onMouseEnter={prefetchThisProduct}
        onFocus={prefetchThisProduct}
      >
        <ProductCardImage
          product={product}
          sizes={imageSizes ?? TRENDING_CARD_IMAGE_SIZES}
          priority={imagePriority}
        />

        <div className="trending-product-card__meta">
          <p className="trending-product-card__brand">{product.brand}</p>
          <ProductCardPrice
            product={product}
            storeId={storeId}
            priceClassName="trending-product-card__price"
          />
        </div>
      </ProductCardLink>
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
          <ProductCardLink
            href={href}
            className="product-card-detailed__image-hit"
            onNavigate={handleNavigate}
            onMouseEnter={prefetchThisProduct}
            onFocus={prefetchThisProduct}
          >
            <ProductCardImage
              product={product}
              sizes={imageSizes ?? DETAILED_CARD_IMAGE_SIZES}
              priority={imagePriority}
            />
          </ProductCardLink>
          {showAnchorMenu ? (
            <ProductCardAnchorMenu
              product={product}
              disabled={chatAnchor?.isAnchorLoading ?? false}
              onActionComplete={onAnchorActionComplete}
            />
          ) : null}
        </div>

        <ProductCardLink
          href={href}
          className="product-card-detailed__body"
          onNavigate={handleNavigate}
          onMouseEnter={prefetchThisProduct}
          onFocus={prefetchThisProduct}
        >
          {showBrandEyebrow ? (
            <p className="product-card-detailed__brand">{product.brand}</p>
          ) : null}
          {showMerchantBadge ? (
            <p className="product-card-detailed__merchant-badge" title={merchantLabel}>
              {merchantLabel}
            </p>
          ) : null}
          <h3 className="product-card-detailed__title" title={toDisplayCase(product.name)}>
            {toDisplayCase(product.name)}
          </h3>
          <ProductCardPrice
            product={product}
            storeId={storeId}
            priceClassName="product-card-detailed__price"
          />
        </ProductCardLink>
      </div>
    </div>
  );
}
