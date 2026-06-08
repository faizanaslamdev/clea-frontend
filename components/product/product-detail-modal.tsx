'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ArrowUpRight, Share2, X } from 'lucide-react';
import { ProductGrid } from '@/components/product-grid';
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingBlock } from '@/components/shared/loading-block';
import { cn } from '@/lib/utils';
import {
  formatPrice,
  resolveStoreIdForProduct,
} from '@/lib/services';
import { useProduct, useSimilarProducts } from '@/lib/hooks/useProducts';

const DESCRIPTION_PREVIEW_LENGTH = 220;

interface ProductDetailModalProps {
  productId: string | null;
  storeId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailModal({
  productId,
  storeId,
  open,
  onOpenChange,
}: ProductDetailModalProps) {
  const { data: product, isLoading } = useProduct(productId ?? '');
  const { data: similarProducts = [] } = useSimilarProducts(productId ?? '', 4);

  const listingStoreId = useMemo(() => {
    if (!product) return null;
    return resolveStoreIdForProduct(product, storeId);
  }, [product, storeId]);

  const listingPrice =
    product && listingStoreId ? product.prices[listingStoreId] : undefined;
  const listingStoreName =
    product?.merchantName ?? listingStoreId ?? 'Butikk';
  const purchaseHref = product?.deepLink ?? undefined;
  const currency = product?.currency ?? 'NOK';

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

  const handleShare = async () => {
    if (!product) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: product.name,
      text: `${product.brand} — ${product.name}`,
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
                ? `${product.brand} ${product.name}`
                : 'Produkt'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Produktdetaljer og lignende varer
          </DialogDescription>

          {isLoading ? (
            <LoadingBlock className="m-8 h-96" />
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
                      <Image
                        src={
                          galleryImages[galleryIndex] ?? product.image
                        }
                        alt={product.name}
                        fill
                        className="product-detail-modal__gallery-image"
                        sizes="(max-width: 768px) 100vw, 520px"
                        priority
                        unoptimized
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
                              unoptimized
                            />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="product-detail-modal__info">
                    <div className="product-detail-modal__intro">
                      <p className="product-detail-modal__brand">{product.brand}</p>
                      <h2 className="product-detail-modal__name">{product.name}</h2>
                      {listingPrice != null ? (
                        <p className="product-detail-modal__price">
                          {formatPrice(listingPrice, currency)}
                        </p>
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

                    {listingPrice != null && purchaseHref ? (
                      <div className="product-detail-modal__purchase">
                        <p className="product-detail-modal__purchase-label">
                          Tilgjengelig hos
                        </p>
                        <a
                          href={purchaseHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="product-detail-modal__purchase-btn"
                        >
                          <span>
                            {listingStoreName} · {formatPrice(listingPrice, currency)}
                          </span>
                          <ArrowUpRight className="size-5 shrink-0" strokeWidth={1.5} />
                        </a>
                      </div>
                    ) : null}

                    <ProductDescription
                      description={product.description}
                      expanded={descriptionExpanded}
                      onExpand={() => setDescriptionExpanded(true)}
                    />
                  </div>
                </div>

                {similarProducts.length > 0 ? (
                  <section
                    className="product-detail-modal__similar"
                    aria-label="Lignende produkter"
                  >
                    <h3 className="product-detail-modal__similar-title">
                      Lignende produkter
                    </h3>
                    <ProductGrid
                      products={similarProducts}
                      storeId={listingStoreId ?? undefined}
                      variant="detailed"
                    />
                  </section>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
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
