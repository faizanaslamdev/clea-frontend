import { PageLayout } from '@/components/layout/page-layout';
import { ProductDetailSkeleton } from '@/components/product/product-detail-skeleton';

export default function ProductLoading() {
  return (
    <PageLayout>
      <article className="product-detail-page section-container section-shell">
        <div className="product-detail-page__toolbar">
          <div
            className="product-detail-page__back-placeholder"
            aria-hidden
          />
        </div>
        <ProductDetailSkeleton />
      </article>
    </PageLayout>
  );
}
