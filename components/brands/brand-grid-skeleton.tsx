import { cn } from '@/lib/utils';

/** Matches BrandGrid masonry rhythm: md / lg / sm cycled across 3 columns. */
const BRAND_SKELETON_HEIGHTS = [
  'h-[260px] md:h-[322px]', // col1 — md
  'h-[260px] md:h-[388px]', // col2 — lg
  'h-[260px] md:h-[228px]', // col3 — sm
  'h-[260px] md:h-[228px]', // col1 — sm
  'h-[260px] md:h-[322px]', // col2 — md
  'h-[260px] md:h-[388px]', // col3 — lg
] as const;

export function BrandGridSkeleton() {
  const columns: Array<Array<(typeof BRAND_SKELETON_HEIGHTS)[number]>> = [
    [],
    [],
    [],
  ];

  BRAND_SKELETON_HEIGHTS.forEach((heightClass, index) => {
    columns[index % 3].push(heightClass);
  });

  return (
    <div
      className="brand-grid"
      aria-hidden
      data-testid="brand-grid-skeleton"
    >
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="brand-column">
          {column.map((heightClass, cardIndex) => (
            <div
              key={`${columnIndex}-${cardIndex}`}
              className={cn(
                'brand-card-skeleton animate-pulse rounded-xl bg-muted',
                heightClass,
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
