'use client';

import type { ReactNode } from 'react';
import { ShopBrowseStatus } from '@/components/shop/shop-browse-status';
import { cn } from '@/lib/utils';

interface ShopPendingSurfaceProps {
  /** True while old Shop content stays mounted under blur + taste pill. */
  pending: boolean;
  /** Daydream-style status copy shown over the blurred surface. */
  label: string;
  /**
   * Allow clicks through the blurred surface (hub ready-nav) so a newer
   * destination can cancel an in-flight prefetch.
   */
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Universal Shop loader frame:
 *   FRAME A ready → FRAME A blurred + taste pill → FRAME B ready
 *
 * Status is a sibling of the blurred surface so `filter` does not capture the
 * fixed pill and blur it too.
 */
export function ShopPendingSurface({
  pending,
  label,
  interactive = false,
  className,
  children,
}: ShopPendingSurfaceProps) {
  return (
    <>
      <div
        className={cn(
          'shop-pending-surface',
          pending && 'shop-pending-surface--pending',
          pending && interactive && 'shop-pending-surface--interactive',
          className,
        )}
        aria-busy={pending || undefined}
      >
        {children}
      </div>
      <ShopBrowseStatus visible={pending && Boolean(label)} label={label} />
    </>
  );
}
