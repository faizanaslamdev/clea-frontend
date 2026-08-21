import { ProductCardSkeleton } from '@/components/product/product-card-skeleton';

const SKELETON_CARD_COUNT = 4;

export function ProductSimilarSkeleton({
  count = SKELETON_CARD_COUNT,
}: {
  count?: number;
}) {
  return (
    <div
      className="product-similar-skeleton"
      aria-hidden
      data-testid="product-similar-skeleton"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="product-similar-skeleton__card">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}
