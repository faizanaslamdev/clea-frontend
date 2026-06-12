import { cn } from '@/lib/utils';

const BRAND_SKELETON_HEIGHTS = [
  'h-[260px] md:h-[322px]',
  'h-[260px] md:h-[388px]',
  'h-[260px] md:h-[228px]',
] as const;

export function BrandGridSkeleton() {
  return (
    <div
      className="brand-grid"
      aria-hidden
      data-testid="brand-grid-skeleton"
    >
      {BRAND_SKELETON_HEIGHTS.map((heightClass, index) => (
        <div key={index} className="brand-column">
          <div
            className={cn(
              'brand-card-skeleton animate-pulse rounded-xl bg-muted',
              heightClass,
            )}
          />
        </div>
      ))}
    </div>
  );
}
