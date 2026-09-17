'use client';

import { RemoteProductImage } from '@/components/product/remote-product-image';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import { cn } from '@/lib/utils';

interface ProductAnchorContextCardProps {
  preview: AnchorPreview;
  className?: string;
}

function formatPrice(preview: AnchorPreview): string | null {
  if (preview.price == null || !Number.isFinite(preview.price)) {
    return null;
  }
  const currency = preview.currency?.trim() || 'NOK';
  try {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(preview.price);
  } catch {
    return `${Math.round(preview.price)} ${currency}`;
  }
}

/**
 * Compact product reference for the AI anchor sheet.
 * Reuses chat anchor preview styling; display-only (no navigation).
 */
export function ProductAnchorContextCard({
  preview,
  className,
}: ProductAnchorContextCardProps) {
  const priceLabel = formatPrice(preview);
  const metaParts = [preview.merchantName?.trim(), priceLabel].filter(Boolean);
  const imageSrc =
    preview.image?.trim() && !preview.unavailable ? preview.image : null;

  return (
    <div
      className={cn(
        'product-anchor-context-card',
        preview.unavailable && 'product-anchor-context-card--unavailable',
        className,
      )}
      aria-label={`${preview.brand ? `${preview.brand}: ` : ''}${preview.name}`}
    >
      <div className="product-anchor-context-card__image-wrap">
        {imageSrc ? (
          <RemoteProductImage
            src={imageSrc}
            alt=""
            fill
            className="product-anchor-context-card__image"
            sizes="72px"
            fallback={
              <div
                className="product-anchor-context-card__image-wrap--empty"
                aria-hidden
              />
            }
          />
        ) : (
          <div
            className="product-anchor-context-card__image-wrap--empty"
            aria-hidden
          />
        )}
      </div>
      <div className="product-anchor-context-card__copy">
        {preview.brand ? (
          <p className="product-anchor-context-card__brand">{preview.brand}</p>
        ) : null}
        <p className="product-anchor-context-card__title">{preview.name}</p>
        {metaParts.length > 0 ? (
          <p className="product-anchor-context-card__meta">
            {metaParts.join(' · ')}
          </p>
        ) : null}
      </div>
    </div>
  );
}
