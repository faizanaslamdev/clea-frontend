'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductDetailView } from '@/components/product/product-detail-view';
import type { EngagementSurface } from '@/lib/api/engagement';

type ProductDesktopModalTarget = {
  productId: string;
  storeId?: string;
  engagementSurface?: EngagementSurface;
};

type ProductDesktopModalContextValue = {
  openProductModal: (
    productId: string,
    storeId?: string,
    engagementSurface?: EngagementSurface,
  ) => void;
  closeProductModal: () => void;
  isProductModalOpen: boolean;
};

const ProductDesktopModalContext =
  createContext<ProductDesktopModalContextValue | null>(null);

/**
 * Desktop listing overlay only. No history.pushState — Back is unchanged;
 * close via X / Escape / overlay. Mobile/tablet never use this path.
 */
export function ProductDesktopModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [target, setTarget] = useState<ProductDesktopModalTarget | null>(null);

  const openProductModal = useCallback(
    (
      productId: string,
      storeId?: string,
      engagementSurface?: EngagementSurface,
    ) => {
      setTarget({ productId, storeId, engagementSurface });
    },
    [],
  );

  const closeProductModal = useCallback(() => {
    setTarget(null);
  }, []);

  const value = useMemo(
    () => ({
      openProductModal,
      closeProductModal,
      isProductModalOpen: target != null,
    }),
    [openProductModal, closeProductModal, target],
  );

  return (
    <ProductDesktopModalContext.Provider value={value}>
      {children}
      <Dialog
        open={target != null}
        onOpenChange={(open) => {
          if (!open) closeProductModal();
        }}
      >
        <DialogPortal>
          <DialogOverlay className="product-detail-desktop-modal-overlay" />
          <DialogPrimitive.Content
            className="product-detail-desktop-modal z-[51]"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <DialogTitle className="sr-only">Produktdetaljer</DialogTitle>
            <DialogDescription className="sr-only">
              Produktdetaljer og lignende varer
            </DialogDescription>
            <button
              type="button"
              className="product-detail-desktop-modal__close"
              onClick={closeProductModal}
              aria-label="Lukk"
            >
              <X className="size-5" strokeWidth={1.5} />
            </button>
            {target ? (
              <div className="product-detail-desktop-modal__scroll">
                <ProductDetailView
                  productId={target.productId}
                  storeId={target.storeId}
                  engagementSurface={
                    target.engagementSurface ?? 'product_page'
                  }
                  presentation="modal"
                  onClose={closeProductModal}
                />
              </div>
            ) : null}
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </ProductDesktopModalContext.Provider>
  );
}

export function useProductDesktopModal() {
  const context = useContext(ProductDesktopModalContext);
  if (!context) {
    throw new Error(
      'useProductDesktopModal must be used within ProductDesktopModalProvider',
    );
  }
  return context;
}
