'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
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

export function ProductModalProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<ProductModalTarget | null>(null);

  const openProduct = useCallback(
    (
      productId: string,
      storeId?: string,
      engagementSurface?: EngagementSurface,
    ) => {
      setTarget({ productId, storeId, engagementSurface });
    },
    [],
  );

  const closeProduct = useCallback(() => {
    setTarget(null);
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
