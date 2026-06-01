'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ArrowUpRight, Share2, X } from 'lucide-react';
import { ProductGrid } from '@/components/product-grid';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import {
  formatPrice,
  getProductById,
  getSimilarProducts,
  getStoreById,
  resolveStoreIdForProduct,
} from '@/lib/services';

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
  const product = productId ? getProductById(productId) : undefined;

  const listingStoreId = useMemo(() => {
    if (!product) return null;
    return resolveStoreIdForProduct(product, storeId);
  }, [product, storeId]);

  const listingStore = listingStoreId ? getStoreById(listingStoreId) : undefined;
  const listingPrice =
    product && listingStoreId ? product.prices[listingStoreId] : undefined;

  const similarProducts = useMemo(
    () => (product ? getSimilarProducts(product.id, 4) : []),
    [product],
  );

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    setDescriptionExpanded(false);
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
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {product ? (
            <>
              <DialogPrimitive.Title className="sr-only">
                {product.brand} {product.name}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">
                Produktdetaljer og lignende varer
              </DialogPrimitive.Description>

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
                        src={product.image}
                        alt={product.name}
                        fill
                        className="product-detail-modal__gallery-image"
                        sizes="(max-width: 768px) 100vw, 520px"
                        priority
                      />
                    </div>
                  </div>

                  <div className="product-detail-modal__info">
                    <div className="product-detail-modal__intro">
                      <p className="product-detail-modal__brand">{product.brand}</p>
                      <h2 className="product-detail-modal__name">{product.name}</h2>
                      {listingPrice != null ? (
                        <p className="product-detail-modal__price">
                          {formatPrice(listingPrice)}
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

                    {listingStore && listingPrice != null ? (
                      <div className="product-detail-modal__purchase">
                        <p className="product-detail-modal__purchase-label">
                          Tilgjengelig hos
                        </p>
                        <a
                          href={
                            listingStore.href ??
                            (listingStoreId ? `#store-${listingStoreId}` : '#')
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="product-detail-modal__purchase-btn"
                        >
                          <span>
                            {listingStore.name} · {formatPrice(listingPrice)}
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
          ) : (
            <DialogPrimitive.Title className="sr-only">Produkt</DialogPrimitive.Title>
          )}
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
