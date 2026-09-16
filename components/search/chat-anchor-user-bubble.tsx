'use client';

import type { MouseEvent } from 'react';
import Link from 'next/link';
import { useProductDesktopModal } from '@/components/product/product-desktop-modal-provider';
import { RemoteProductImage } from '@/components/product/remote-product-image';
import { anchorDisplayLabel } from '@/lib/chat/anchor-display-label';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import { getProductHref } from '@/lib/domain/products/paths';
import { shouldOpenProductDesktopModal } from '@/lib/navigation/product-desktop-modal';
import { cn } from '@/lib/utils';

interface ChatAnchorUserBubbleProps {
  preview: AnchorPreview;
  actionLabel: string;
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

export function ChatAnchorUserBubble({
  preview,
  actionLabel,
}: ChatAnchorUserBubbleProps) {
  const { openProductModal } = useProductDesktopModal();
  const href = getProductHref(preview.productId);
  const priceLabel = formatPrice(preview);
  const metaParts = [preview.merchantName?.trim(), priceLabel].filter(Boolean);
  const imageSrc =
    preview.image?.trim() && !preview.unavailable ? preview.image : null;

  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    if (shouldOpenProductDesktopModal()) {
      event.preventDefault();
      openProductModal(preview.productId);
    }
  };

  return (
    <div className="search-chat-anchor-ref">
      <Link
        href={href}
        onClick={handleNavigate}
        className={cn(
          'search-chat-anchor-ref__card',
          preview.unavailable && 'search-chat-anchor-ref__card--unavailable',
        )}
        aria-label={`${preview.brand ? `${preview.brand}: ` : ''}${preview.name}`}
      >
        <div className="search-chat-anchor-ref__product">
          <div className="search-chat-anchor-ref__image-wrap">
            {imageSrc ? (
              <RemoteProductImage
                src={imageSrc}
                alt=""
                fill
                className="search-chat-anchor-ref__image"
                sizes="72px"
                fallback={
                  <div
                    className="search-chat-anchor-ref__image-wrap--empty"
                    aria-hidden
                  />
                }
              />
            ) : (
              <div
                className="search-chat-anchor-ref__image-wrap--empty"
                aria-hidden
              />
            )}
          </div>
          <div className="search-chat-anchor-ref__copy">
            {preview.brand ? (
              <p className="search-chat-anchor-ref__brand">{preview.brand}</p>
            ) : null}
            <p className="search-chat-anchor-ref__title">{preview.name}</p>
            {metaParts.length > 0 ? (
              <p className="search-chat-anchor-ref__meta">{metaParts.join(' · ')}</p>
            ) : null}
          </div>
        </div>
        <div className="search-chat-anchor-ref__action">
          <span title={actionLabel}>{anchorDisplayLabel(actionLabel)}</span>
        </div>
      </Link>
    </div>
  );
}
