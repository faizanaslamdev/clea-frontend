'use client';

import { ArrowUpRight } from 'lucide-react';
import { formatPrice } from '@/lib/services';
import type { ProductOffer } from '@/lib/api/products';
import { cn } from '@/lib/utils';

interface ProductBestPricesProps {
  offers: ProductOffer[];
  currency: string;
  anchorProductId: string;
  onOutboundClick?: (productId: string) => void;
}

export function ProductBestPrices({
  offers,
  currency,
  anchorProductId,
  onOutboundClick,
}: ProductBestPricesProps) {
  const sorted = [...offers].sort((a, b) => {
    if (a.in_stock !== b.in_stock) {
      return a.in_stock ? -1 : 1;
    }
    return a.price - b.price;
  });

  const cheapestInStockId =
    sorted.find((offer) => offer.in_stock)?.id ?? sorted[0]?.id;

  return (
    <section
      className="product-detail-modal__best-prices"
      aria-label="Beste priser"
    >
      <h3 className="product-detail-modal__best-prices-title">Beste priser</h3>
      <ul className="product-detail-modal__best-prices-list">
        {sorted.map((offer) => {
          const isCheapest = offer.id === cheapestInStockId && offer.in_stock;
          const isAnchor = offer.id === anchorProductId;

          return (
            <li
              key={offer.id}
              className={cn(
                'product-detail-modal__best-prices-item',
                isCheapest && 'product-detail-modal__best-prices-item--best',
              )}
            >
              <div className="product-detail-modal__best-prices-meta">
                <p className="product-detail-modal__best-prices-merchant">
                  {offer.merchant_name ?? 'Butikk'}
                  {isAnchor ? (
                    <span className="product-detail-modal__best-prices-current">
                      {' '}
                      · valgt
                    </span>
                  ) : null}
                </p>
                <p className="product-detail-modal__best-prices-price">
                  {formatPrice(offer.price, offer.currency ?? currency)}
                  {isCheapest ? (
                    <span className="product-detail-modal__best-prices-badge">
                      Laveste pris
                    </span>
                  ) : null}
                </p>
                <p
                  className={cn(
                    'product-detail-modal__best-prices-stock',
                    !offer.in_stock &&
                      'product-detail-modal__best-prices-stock--out',
                  )}
                >
                  {offer.in_stock ? 'På lager' : 'Ikke på lager'}
                </p>
              </div>
              {offer.deep_link ? (
                <a
                  href={offer.deep_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="product-detail-modal__best-prices-cta"
                  onClick={() => onOutboundClick?.(offer.id)}
                >
                  <span>Gå til butikk</span>
                  <ArrowUpRight className="size-4 shrink-0" strokeWidth={1.5} />
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

interface ProductBestPricesSkeletonProps {
  rows?: number;
}

export function ProductBestPricesSkeleton({
  rows = 2,
}: ProductBestPricesSkeletonProps) {
  return (
    <section
      className="product-detail-modal__best-prices product-detail-modal__best-prices--loading"
      aria-label="Laster beste priser"
      aria-busy="true"
    >
      <div className="product-detail-modal-skeleton__line product-detail-modal-skeleton__line--label" />
      <ul className="product-detail-modal__best-prices-list">
        {Array.from({ length: rows }, (_, index) => (
          <li
            key={`best-price-skeleton-${index}`}
            className="product-detail-modal__best-prices-item product-detail-modal__best-prices-item--skeleton"
          >
            <div className="product-detail-modal-skeleton__line product-detail-modal-skeleton__line--body" />
            <div className="product-detail-modal-skeleton__line product-detail-modal-skeleton__line--body-short" />
          </li>
        ))}
      </ul>
    </section>
  );
}

interface ProductBestPricesErrorProps {
  onRetry: () => void;
}

export function ProductBestPricesError({ onRetry }: ProductBestPricesErrorProps) {
  return (
    <section className="product-detail-modal__best-prices product-detail-modal__best-prices--error">
      <p className="product-detail-modal__best-prices-error">
        Kunne ikke laste prissammenligning.
      </p>
      <button
        type="button"
        className="product-detail-modal__best-prices-retry"
        onClick={onRetry}
      >
        Prøv igjen
      </button>
    </section>
  );
}
