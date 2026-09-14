'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, type PanInfo } from 'motion/react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Share2, X } from 'lucide-react';
import { ProductGrid } from '@/components/product-grid';
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toDisplayCase } from '@/lib/services';
import {
  formatPrice,
  getListingPriceStore,
  resolveStoreIdForProduct,
} from '@/lib/services';
import { ProductCardAnchorMenu } from '@/components/product/product-card-anchor-menu';
import { NotifyMeButton } from '@/components/auth/notify-me-button';
import { ProductDetailModalSkeleton } from '@/components/product/product-detail-modal-skeleton';
import { ProductSimilarSkeleton } from '@/components/product/product-similar-skeleton';
import {
  PRODUCT_LOAD_ERROR_MESSAGE,
  PRODUCT_NOT_FOUND_MESSAGE,
} from '@/lib/api/api-errors';
import type { EngagementSurface } from '@/lib/api/engagement';
import { useEngagementTracking } from '@/lib/hooks/useEngagementTracking';
import { useProduct, useProductOffers, useSimilarProducts } from '@/lib/hooks/useProducts';
import {
  ProductBestPrices,
  ProductBestPricesError,
  ProductBestPricesSkeleton,
} from '@/components/product/product-best-prices';

const DESCRIPTION_PREVIEW_LENGTH = 220;

/** Past this drag distance (px) the swipe commits to the next/previous image. */
const GALLERY_SWIPE_DISTANCE_PX = 56;
/** ...or past this flick speed (px/s), even if the distance was short. */
const GALLERY_SWIPE_VELOCITY = 350;

interface ProductDetailModalProps {
  productId: string | null;
  storeId?: string;
  engagementSurface?: EngagementSurface;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailModal({
  productId,
  storeId,
  engagementSurface = 'product_page',
  open,
  onOpenChange,
}: ProductDetailModalProps) {
  const {
    data: product,
    isLoading,
    isError,
    isFetched,
  } = useProduct(productId ?? '');
  const {
    data: similarProducts = [],
    isLoading: isSimilarLoading,
  } = useSimilarProducts(productId ?? '', 4);
  const {
    data: productOffers,
    isLoading: isOffersLoading,
    isError: isOffersError,
    refetch: refetchOffers,
  } = useProductOffers(productId ?? '', Boolean(productId) && open && Boolean(product));
  const { trackDetailView, trackOutboundClick } =
    useEngagementTracking(engagementSurface);

  const listingStoreId = useMemo(() => {
    if (!product) return null;
    return resolveStoreIdForProduct(product, storeId);
  }, [product, storeId]);

  const listing = useMemo(() => {
    if (!product) return null;
    return getListingPriceStore(product, listingStoreId ?? storeId ?? undefined);
  }, [product, listingStoreId, storeId]);

  const listingPrice = listing?.price;
  const listingInStock = listing?.inStock ?? true;
  const listingStoreName =
    product?.merchantName ?? listingStoreId ?? 'Butikk';
  const purchaseHref = product?.deepLink ?? undefined;
  const currency = product?.currency ?? 'NOK';
  const showBestPrices = productOffers?.compareReady === true;
  const showSingleStorePurchase =
    listingPrice != null && purchaseHref && !showBestPrices;

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const galleryImages =
    product?.images && product.images.length > 0
      ? product.images
      : product?.image
        ? [product.image]
        : [];

  useEffect(() => {
    setDescriptionExpanded(false);
    setGalleryIndex(0);
  }, [productId]);

  useEffect(() => {
    if (open && productId) {
      trackDetailView(productId);
    }
  }, [open, productId, trackDetailView]);

  const showPreviousGalleryImage = () => {
    setGalleryIndex((current) =>
      current === 0 ? galleryImages.length - 1 : current - 1,
    );
  };

  const showNextGalleryImage = () => {
    setGalleryIndex((current) =>
      current === galleryImages.length - 1 ? 0 : current + 1,
    );
  };

  /* Swipe to change image. Distance OR velocity counts, so a short flick
     works as well as a slow drag -- requiring distance alone makes fast
     swipes feel broken. */
  const handleGalleryDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (galleryImages.length <= 1) return;

    const { offset, velocity } = info;
    // Direction lock means a mostly-vertical gesture is a scroll, not a swipe.
    if (Math.abs(offset.x) < Math.abs(offset.y)) return;

    if (offset.x <= -GALLERY_SWIPE_DISTANCE_PX || velocity.x <= -GALLERY_SWIPE_VELOCITY) {
      showNextGalleryImage();
      return;
    }

    if (offset.x >= GALLERY_SWIPE_DISTANCE_PX || velocity.x >= GALLERY_SWIPE_VELOCITY) {
      showPreviousGalleryImage();
    }
  };

  const handleShare = async () => {
    if (!product) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: toDisplayCase(product.name),
      text: `${product.brand} — ${toDisplayCase(product.name)}`,
      url,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* fall through */
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="product-detail-modal-overlay" />
        <DialogPrimitive.Content
          className="product-detail-modal"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">
            {isLoading
              ? 'Laster produkt'
              : product
                ? `${product.brand} ${toDisplayCase(product.name)}`
                : 'Produkt'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Produktdetaljer og lignende varer
          </DialogDescription>

          {isLoading ? (
            <ProductDetailModalSkeleton onClose={() => onOpenChange(false)} />
          ) : isError ? (
            <ProductModalErrorState
              message={PRODUCT_LOAD_ERROR_MESSAGE}
              onClose={() => onOpenChange(false)}
            />
          ) : product ? (
            <>
              <button
                type="button"
                className="product-detail-modal__close"
                onClick={() => onOpenChange(false)}
                aria-label="Lukk"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>

              <div className="product-detail-modal__scroll">
                <div className="product-detail-modal__main">
                  <div className="product-detail-modal__gallery">
                    <div className="product-detail-modal__gallery-frame">
                      <div className="product-detail-modal__gallery-stage">
                        <motion.div
                          className="product-detail-modal__gallery-drag"
                          drag={galleryImages.length > 1 ? 'x' : false}
                          dragDirectionLock
                          dragElastic={0.16}
                          dragMomentum={false}
                          /* Snaps back on release; the index change is what
                             actually moves the gallery on. */
                          dragConstraints={{ left: 0, right: 0 }}
                          onDragEnd={handleGalleryDragEnd}
                        >
                          <Image
                            src={
                              galleryImages[galleryIndex] ?? product.image
                            }
                            alt={toDisplayCase(product.name)}
                            width={800}
                            height={1067}
                            className="product-detail-modal__gallery-image"
                            sizes="(max-width: 768px) 100vw, 520px"
                            priority
                            draggable={false}
                          />
                        </motion.div>
                        <ProductCardAnchorMenu
                          product={product}
                          className="product-detail-modal__gallery-anchor"
                          onActionComplete={() => onOpenChange(false)}
                        />
                        {galleryImages.length > 1 ? (
                          <>
                            <button
                              type="button"
                              className="product-detail-modal__gallery-nav product-detail-modal__gallery-nav--prev"
                              aria-label="Forrige bilde"
                              onClick={showPreviousGalleryImage}
                            >
                              <ChevronLeft
                                className="size-7"
                                strokeWidth={1.5}
                                aria-hidden
                              />
                            </button>
                            <button
                              type="button"
                              className="product-detail-modal__gallery-nav product-detail-modal__gallery-nav--next"
                              aria-label="Neste bilde"
                              onClick={showNextGalleryImage}
                            >
                              <ChevronRight
                                className="size-7"
                                strokeWidth={1.5}
                                aria-hidden
                              />
                            </button>
                          </>
                        ) : null}
                        {galleryImages.length > 1 ? (
                          <div
                            className="product-detail-modal__gallery-dots"
                            role="tablist"
                            aria-label="Produktbilder"
                          >
                            {galleryImages.map((src, index) => (
                              <button
                                key={`${src}-dot-${index}`}
                                type="button"
                                role="tab"
                                aria-selected={index === galleryIndex}
                                aria-label={`Bilde ${index + 1} av ${galleryImages.length}`}
                                className={cn(
                                  'product-detail-modal__gallery-dot',
                                  index === galleryIndex &&
                                    'product-detail-modal__gallery-dot--active',
                                )}
                                onClick={() => setGalleryIndex(index)}
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    {galleryImages.length > 1 ? (
                      <div
                        className="product-detail-modal__thumbs"
                        role="list"
                        aria-label="Produktbilder"
                      >
                        {galleryImages.map((src, index) => (
                          <button
                            key={`${src}-${index}`}
                            type="button"
                            role="listitem"
                            aria-label={`Bilde ${index + 1} av ${galleryImages.length}`}
                            aria-current={
                              index === galleryIndex ? 'true' : undefined
                            }
                            className={cn(
                              'product-detail-modal__thumb',
                              index === galleryIndex &&
                                'product-detail-modal__thumb--active',
                            )}
                            onClick={() => setGalleryIndex(index)}
                          >
                            <Image
                              src={src}
                              alt=""
                              width={72}
                              height={96}
                              className="product-detail-modal__thumb-image"
                            />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="product-detail-modal__info">
                    <div className="product-detail-modal__intro">
                      <p className="product-detail-modal__brand">{product.brand}</p>
                      <h2 className="product-detail-modal__name">{toDisplayCase(product.name)}</h2>
                      {listingPrice != null ? (
                        <div className="product-detail-modal__price-row">
                          <p className="product-detail-modal__price">
                            {formatPrice(listingPrice, currency)}
                          </p>
                          {!listingInStock ? (
                            <span
                              className="product-detail-modal__stock-badge"
                              role="status"
                            >
                              Ikke på lager
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="product-detail-modal__price-placeholder" aria-hidden />
                      )}
                      <button
                        type="button"
                        className="product-detail-modal__share"
                        onClick={handleShare}
                        aria-label="Del produkt"
                      >
                        <Share2 className="size-4.5" strokeWidth={1.5} />
                      </button>
                    </div>

                    {isOffersLoading ? (
                      <ProductBestPricesSkeleton rows={2} />
                    ) : isOffersError ? (
                      <ProductBestPricesError onRetry={() => void refetchOffers()} />
                    ) : showBestPrices && productOffers ? (
                      <ProductBestPrices
                        offers={productOffers.offers}
                        currency={currency}
                        anchorProductId={product.id}
                        onOutboundClick={(offerProductId) =>
                          trackOutboundClick(offerProductId)
                        }
                      />
                    ) : null}

                    {showSingleStorePurchase ? (
                      <div className="product-detail-modal__purchase">
                        <p className="product-detail-modal__purchase-label">
                          Tilgjengelig hos
                        </p>
                        <a
                          href={purchaseHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="product-detail-modal__purchase-btn"
                          onClick={() => trackOutboundClick(product.id)}
                        >
                          <span>
                            {listingStoreName} · {formatPrice(listingPrice, currency)}
                          </span>
                          <ArrowUpRight className="size-5 shrink-0" strokeWidth={1.5} />
                        </a>
                        <NotifyMeButton
                          productId={product.id}
                          className="product-detail-modal__notify"
                        />
                      </div>
                    ) : showBestPrices ? (
                      <NotifyMeButton
                        productId={product.id}
                        className="product-detail-modal__notify"
                      />
                    ) : null}

                    <ProductDescription
                      description={product.description}
                      expanded={descriptionExpanded}
                      onExpand={() => setDescriptionExpanded(true)}
                    />
                  </div>
                </div>

                {isSimilarLoading || similarProducts.length > 0 ? (
                  <section
                    className="product-detail-modal__similar"
                    aria-label="Lignende produkter"
                    aria-busy={isSimilarLoading}
                  >
                    <h3 className="product-detail-modal__similar-title">
                      Lignende produkter
                    </h3>
                    {isSimilarLoading ? (
                      <>
                        <p className="sr-only">Laster lignende produkter</p>
                        <ProductSimilarSkeleton />
                      </>
                    ) : (
                      <ProductGrid
                        products={similarProducts}
                        storeId={listingStoreId ?? undefined}
                        variant="detailed"
                        enableAnchorActions
                        onAnchorActionComplete={() => onOpenChange(false)}
                      />
                    )}
                  </section>
                ) : null}
              </div>
            </>
          ) : isFetched ? (
            <ProductModalErrorState
              message={PRODUCT_NOT_FOUND_MESSAGE}
              onClose={() => onOpenChange(false)}
            />
          ) : null}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function ProductModalErrorState({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="product-detail-modal__error">
      <button
        type="button"
        className="product-detail-modal__close"
        onClick={onClose}
        aria-label="Lukk"
      >
        <X className="size-5" strokeWidth={1.5} />
      </button>
      <p className="product-detail-modal__error-message">{message}</p>
      <button
        type="button"
        className="product-detail-modal__error-retry"
        onClick={onClose}
      >
        Lukk
      </button>
    </div>
  );
}

function ProductDescription({
  description,
  expanded,
  onExpand,
}: {
  description: string;
  expanded: boolean;
  onExpand: () => void;
}) {
  const canExpand = description.length > DESCRIPTION_PREVIEW_LENGTH;
  const preview = canExpand
    ? `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd()}…`
    : description;

  return (
    <div className="product-detail-modal__description">
      <p>
        {expanded ? description : preview}
        {canExpand && !expanded ? (
          <>
            {' '}
            <button
              type="button"
              className="product-detail-modal__see-more"
              onClick={onExpand}
            >
              Les mer
            </button>
          </>
        ) : null}
      </p>
    </div>
  );
}
