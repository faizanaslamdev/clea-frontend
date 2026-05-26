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

type ProductModalTarget = {
  productId: string;
  storeId?: string;
};

type ProductModalContextValue = {
  openProduct: (productId: string, storeId?: string) => void;
  closeProduct: () => void;
  isOpen: boolean;
};

const ProductModalContext = createContext<ProductModalContextValue | null>(null);

export function ProductModalProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<ProductModalTarget | null>(null);

  const openProduct = useCallback((productId: string, storeId?: string) => {
    setTarget({ productId, storeId });
  }, []);

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
