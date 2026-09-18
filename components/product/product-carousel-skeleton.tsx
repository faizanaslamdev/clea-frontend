import { ProductCardSkeleton } from '@/components/product/product-card-skeleton';

const DEFAULT_CAROUSEL_SKELETON_COUNT = 5;

/**
 * Matches `.product-carousel__track` layout so loading → content does not
 * jump from a contained grid/row into the full-bleed horizontal track.
 */
export function ProductCarouselSkeleton({
  count = DEFAULT_CAROUSEL_SKELETON_COUNT,
}: {
  count?: number;
}) {
  return (
    <div
      className="relative overflow-hidden"
      aria-hidden
      data-testid="product-carousel-skeleton"
    >
      <div className="product-carousel__track">
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            data-product-slide
            className="flex w-[min(68vw,13.125rem)] shrink-0 snap-start flex-col px-0.5 py-1 sm:w-[210px] md:w-[270px]"
          >
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
