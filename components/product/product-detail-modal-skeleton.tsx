import { X } from 'lucide-react';
import { ProductSimilarSkeleton } from '@/components/product/product-similar-skeleton';

interface ProductDetailModalSkeletonProps {
  onClose: () => void;
}

export function ProductDetailModalSkeleton({
  onClose,
}: ProductDetailModalSkeletonProps) {
  return (
    <>
      <button
        type="button"
        className="product-detail-modal__close"
        onClick={onClose}
        aria-label="Lukk"
      >
        <X className="size-5" strokeWidth={1.5} />
      </button>

      <div
        className="product-detail-modal__scroll"
        aria-busy="true"
        aria-label="Laster produkt"
      >
        <div className="product-detail-modal__main product-detail-modal-skeleton__main">
          <div className="product-detail-modal__gallery">
            <div className="product-detail-modal__gallery-frame">
              <div
                className="product-detail-modal-skeleton__gallery-image"
                aria-hidden
              />
            </div>
          </div>

          <div className="product-detail-modal__info product-detail-modal-skeleton__info">
            <div className="product-detail-modal-skeleton__intro">
              <div className="product-detail-modal-skeleton__line product-detail-modal-skeleton__line--brand" />
              <div className="product-detail-modal-skeleton__line product-detail-modal-skeleton__line--title" />
              <div className="product-detail-modal-skeleton__line product-detail-modal-skeleton__line--title-short" />
              <div className="product-detail-modal-skeleton__line product-detail-modal-skeleton__line--price" />
            </div>

            <div className="product-detail-modal-skeleton__purchase">
              <div className="product-detail-modal-skeleton__line product-detail-modal-skeleton__line--label" />
              <div className="product-detail-modal-skeleton__purchase-btn" />
            </div>

            <div className="product-detail-modal-skeleton__description">
              <div className="product-detail-modal-skeleton__line product-detail-modal-skeleton__line--body" />
              <div className="product-detail-modal-skeleton__line product-detail-modal-skeleton__line--body" />
              <div className="product-detail-modal-skeleton__line product-detail-modal-skeleton__line--body-short" />
            </div>
          </div>
        </div>

        <section
          className="product-detail-modal__similar"
          aria-label="Lignende produkter"
          aria-busy="true"
        >
          <h3 className="product-detail-modal__similar-title">
            Lignende produkter
          </h3>
          <ProductSimilarSkeleton />
        </section>
      </div>
    </>
  );
}
