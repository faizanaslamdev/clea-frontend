import { ProductCardSkeleton } from '@/components/product/product-card-skeleton';

const DEFAULT_CAROUSEL_SKELETON_COUNT = 5;

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
      <div className="flex gap-4 overflow-x-hidden py-3 pb-6">
        <div className="w-5 shrink-0 md:w-6 lg:w-10 xl:w-14" />
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className="flex w-[210px] shrink-0 flex-col px-0.5 py-1 md:w-[270px]"
          >
            <ProductCardSkeleton />
          </div>
        ))}
        <div className="w-5 shrink-0 md:w-6 lg:w-10 xl:w-14" />
      </div>
    </div>
  );
}
