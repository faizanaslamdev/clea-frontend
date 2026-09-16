'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from 'motion/react';
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { ProductGrid } from '@/components/product-grid';
import { RemoteProductImage } from '@/components/product/remote-product-image';
import { cn } from '@/lib/utils';
import { toDisplayCase } from '@/lib/services';
import {
  formatPrice,
  getListingPriceStore,
  resolveStoreIdForProduct,
} from '@/lib/services';
import { getProductHref } from '@/lib/domain/products/paths';
import { ProductCardAnchorMenu } from '@/components/product/product-card-anchor-menu';
import { useChatAnchorConnection } from '@/components/chat/chat-anchor-provider';
import { NotifyMeButton } from '@/components/auth/notify-me-button';
import { ProductDetailSkeleton } from '@/components/product/product-detail-skeleton';
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
const GALLERY_SWIPE_DISTANCE_PX = 56;
const GALLERY_SWIPE_VELOCITY = 350;
const GALLERY_SLIDE_EASE = [0.22, 1, 0.36, 1] as const;

const gallerySlideVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? '72%' : '-72%',
    opacity: 0.35,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? '-72%' : '72%',
    opacity: 0.35,
  }),
};

export interface ProductDetailViewProps {
  productId: string;
  storeId?: string;
  engagementSurface?: EngagementSurface;
  /** Page route vs desktop listing overlay — same data/UI, different chrome. */
  presentation?: 'page' | 'modal';
  onClose?: () => void;
}

export function ProductDetailView({
  productId,
  storeId,
  engagementSurface = 'product_page',
  presentation = 'page',
  onClose,
}: ProductDetailViewProps) {
  const router = useRouter();
  const chatAnchor = useChatAnchorConnection();
  const shouldReduceMotion = useReducedMotion();
  const isModal = presentation === 'modal';
  const {
    data: product,
    isLoading,
    isError,
    isFetched,
  } = useProduct(productId);
  const { data: similarProducts = [], isLoading: isSimilarLoading } =
    useSimilarProducts(productId, 4);
  const {
    data: productOffers,
    isLoading: isOffersLoading,
    isError: isOffersError,
    refetch: refetchOffers,
  } = useProductOffers(productId, Boolean(productId) && Boolean(product));
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
  const listingStoreName = product?.merchantName ?? listingStoreId ?? 'Butikk';
  const purchaseHref = product?.deepLink ?? undefined;
  const currency = product?.currency ?? 'NOK';
  const showBestPrices = productOffers?.compareReady === true;
  const showSingleStorePurchase =
    listingPrice != null && purchaseHref && !showBestPrices;

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  /** 1 = next (slide left), -1 = previous (slide right) — shared by gallery + product swaps. */
  const [slideDirection, setSlideDirection] = useState(1);
  const [activeProductId, setActiveProductId] = useState(productId);

  if (productId !== activeProductId) {
    setActiveProductId(productId);
    setSlideDirection(1);
    setGalleryIndex(0);
    setDescriptionExpanded(false);
  }

  const galleryImages =
    product?.images && product.images.length > 0
      ? product.images
      : product?.image
        ? [product.image]
        : [];

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return getProductHref(productId, { storeId });
    }
    return `${window.location.origin}${getProductHref(productId)}`;
  }, [productId, storeId]);

  useEffect(() => {
    if (productId) {
      trackDetailView(productId);
    }
  }, [productId, trackDetailView]);

  const goToGalleryIndex = (nextIndex: number) => {
    if (nextIndex === galleryIndex) return;
    setSlideDirection(nextIndex > galleryIndex ? 1 : -1);
    setGalleryIndex(nextIndex);
  };

  const showPreviousGalleryImage = () => {
    const next =
      galleryIndex === 0 ? galleryImages.length - 1 : galleryIndex - 1;
    setSlideDirection(-1);
    setGalleryIndex(next);
  };

  const showNextGalleryImage = () => {
    const next =
      galleryIndex === galleryImages.length - 1 ? 0 : galleryIndex + 1;
    setSlideDirection(1);
    setGalleryIndex(next);
  };

  const handleGalleryDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (galleryImages.length <= 1) return;

    const { offset, velocity } = info;
    if (Math.abs(offset.x) < Math.abs(offset.y)) return;

    if (
      offset.x <= -GALLERY_SWIPE_DISTANCE_PX ||
      velocity.x <= -GALLERY_SWIPE_VELOCITY
    ) {
      showNextGalleryImage();
      return;
    }

    if (
      offset.x >= GALLERY_SWIPE_DISTANCE_PX ||
      velocity.x >= GALLERY_SWIPE_VELOCITY
    ) {
      showPreviousGalleryImage();
    }
  };

  const gallerySlideTransition = shouldReduceMotion
    ? { duration: 0.12 }
    : { duration: 0.32, ease: GALLERY_SLIDE_EASE };

  const galleryMotionProps = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        custom: slideDirection,
        variants: gallerySlideVariants,
        initial: 'enter' as const,
        animate: 'center' as const,
        exit: 'exit' as const,
      };

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: toDisplayCase(product.name),
      text: `${product.brand} — ${toDisplayCase(product.name)}`,
      url: shareUrl,
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
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  const handleBack = () => {
    if (isModal) {
      onClose?.();
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/brands');
  };

  return (
    <article
      className={
        isModal
          ? 'product-detail-view product-detail-view--modal'
          : 'product-detail-view product-detail-page section-container section-shell'
      }
    >
      {isModal ? null : (
        <div className="product-detail-page__toolbar">
          <button
            type="button"
            className="product-detail-page__back"
            onClick={handleBack}
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
            Tilbake
          </button>
        </div>
      )}

      {isLoading ? (
        <ProductDetailSkeleton />
      ) : isError ? (
        <ProductDetailErrorState
          message={PRODUCT_LOAD_ERROR_MESSAGE}
          onClose={isModal ? onClose : undefined}
        />
      ) : product ? (
        <div className="product-detail-page__body">
          <div className="product-detail-modal__main">
            <div className="product-detail-modal__gallery">
                    <div className="product-detail-modal__gallery-frame">
                      <div className="product-detail-modal__gallery-stage">
                        <AnimatePresence
                          initial={false}
                          custom={slideDirection}
                          mode="popLayout"
                        >
                          <motion.div
                            key={`${productId}-${galleryIndex}`}
                            className="product-detail-modal__gallery-drag"
                            {...galleryMotionProps}
                            transition={gallerySlideTransition}
                            drag={galleryImages.length > 1 ? 'x' : false}
                            dragDirectionLock
                            dragElastic={0.16}
                            dragMomentum={false}
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={handleGalleryDragEnd}
                          >
                            <RemoteProductImage
                              src={galleryImages[galleryIndex] ?? product.image}
                              alt={toDisplayCase(product.name)}
                              width={800}
                              height={1067}
                              className="product-detail-modal__gallery-image"
                              sizes="(max-width: 768px) 100vw, 520px"
                              priority
                              draggable={false}
                              fallback={
                                <div
                                  className="product-detail-modal__gallery-image product-detail-modal__gallery-image--fallback"
                                  aria-hidden
                                />
                              }
                            />
                          </motion.div>
                        </AnimatePresence>
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
                                onClick={() => goToGalleryIndex(index)}
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                      {/* Same AI spark menu as ProductCard — bottom-left on the media. */}
                      <ProductCardAnchorMenu
                        product={product}
                        disabled={chatAnchor?.isAnchorLoading ?? false}
                        className="product-detail-modal__gallery-anchor"
                      />
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
                      aria-current={index === galleryIndex ? 'true' : undefined}
                      className={cn(
                        'product-detail-modal__thumb',
                        index === galleryIndex &&
                          'product-detail-modal__thumb--active',
                      )}
                      onClick={() => goToGalleryIndex(index)}
                    >
                      <RemoteProductImage
                        src={src}
                        alt=""
                        width={72}
                        height={96}
                        className="product-detail-modal__thumb-image"
                        fallback={
                          <span
                            className="product-detail-modal__thumb-image product-detail-modal__thumb-image--fallback"
                            aria-hidden
                          />
                        }
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="product-detail-modal__info">
              <div className="product-detail-modal__intro">
                <p className="product-detail-modal__brand">{product.brand}</p>
                <h1 className="product-detail-modal__name">
                  {toDisplayCase(product.name)}
                </h1>
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
                  <span
                    className="product-detail-modal__price-placeholder"
                    aria-hidden
                  />
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
                    <ArrowUpRight
                      className="size-5 shrink-0"
                      strokeWidth={1.5}
                    />
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
              <h2 className="product-detail-modal__similar-title">
                Lignende produkter
              </h2>
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
                />
              )}
            </section>
          ) : null}
        </div>
      ) : isFetched ? (
        <ProductDetailErrorState
          message={PRODUCT_NOT_FOUND_MESSAGE}
          onClose={isModal ? onClose : undefined}
        />
      ) : null}
    </article>
  );
}

function ProductDetailErrorState({
  message,
  onClose,
}: {
  message: string;
  onClose?: () => void;
}) {
  return (
    <div className="product-detail-page__error">
      <p className="product-detail-page__error-message">{message}</p>
      {onClose ? (
        <button
          type="button"
          className="product-detail-page__error-link"
          onClick={onClose}
        >
          Lukk
        </button>
      ) : (
        <Link href="/brands" className="product-detail-page__error-link">
          Tilbake til merker
        </Link>
      )}
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
