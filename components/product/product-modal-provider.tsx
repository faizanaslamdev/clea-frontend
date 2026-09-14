'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ProductDetailModal } from './product-detail-modal';

import type { EngagementSurface } from '@/lib/api/engagement';

type ProductModalTarget = {
  productId: string;
  storeId?: string;
  engagementSurface?: EngagementSurface;
};

type ProductModalContextValue = {
  openProduct: (
    productId: string,
    storeId?: string,
    engagementSurface?: EngagementSurface,
  ) => void;
  closeProduct: () => void;
  isOpen: boolean;
};

const ProductModalContext = createContext<ProductModalContextValue | null>(null);

/** Marks the history entry this modal owns, so we only ever pop our own. */
const MODAL_HISTORY_MARKER = 'cleaProductModal';

export function ProductModalProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<ProductModalTarget | null>(null);
  const pushedHistoryRef = useRef(false);

  const openProduct = useCallback(
    (
      productId: string,
      storeId?: string,
      engagementSurface?: EngagementSurface,
    ) => {
      setTarget({ productId, storeId, engagementSurface });

      // One history entry per open. This is what makes the phone's back
      // button -- and the edge-swipe back gesture on both Android and iOS --
      // close the product instead of navigating the page underneath it away.
      if (typeof window !== 'undefined' && !pushedHistoryRef.current) {
        window.history.pushState({ [MODAL_HISTORY_MARKER]: true }, '');
        pushedHistoryRef.current = true;
      }
    },
    [],
  );

  const closeProduct = useCallback(() => {
    // Close immediately rather than waiting on popstate, so the X and Escape
    // never feel laggy.
    setTarget(null);

    if (!pushedHistoryRef.current) return;
    pushedHistoryRef.current = false;

    // Only pop when our own entry is still the current one. If something
    // navigated in the meantime (a link inside the modal, say), going back
    // here would throw the user off the page they just landed on.
    if (window.history.state?.[MODAL_HISTORY_MARKER]) {
      window.history.back();
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (!pushedHistoryRef.current) return;
      pushedHistoryRef.current = false;
      setTarget(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const value = useMemo(
    () => ({
      openProduct,
      closeProduct,
      isOpen: target != null,
    }),
    [openProduct, closeProduct, target],
  );

  return (
    <ProductModalContext.Provider value={value}>
      {children}
      <ProductDetailModal
        productId={target?.productId ?? null}
        storeId={target?.storeId}
        engagementSurface={target?.engagementSurface ?? 'product_page'}
        open={target != null}
        onOpenChange={(open: boolean) => {
          if (!open) closeProduct();
        }}
      />
    </ProductModalContext.Provider>
  );
}

export function useProductModal() {
  const context = useContext(ProductModalContext);
  if (!context) {
    throw new Error('useProductModal must be used within ProductModalProvider');
  }
  return context;
}
