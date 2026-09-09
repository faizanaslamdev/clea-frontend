export function BrandGridSkeleton() {
  // Matches the expanded editorial brands grid (incl. beauty/watches merchants).
  const cardsPerColumn = [4, 4, 4] as const;

  return (
    <div
      className="brand-grid"
      aria-hidden
      data-testid="brand-grid-skeleton"
    >
      {cardsPerColumn.map((cardCount, columnIndex) => (
        <div key={columnIndex} className="brand-column">
          {Array.from({ length: cardCount }, (_, cardIndex) => (
            <div
              key={`${columnIndex}-${cardIndex}`}
              className="brand-card-skeleton aspect-4/3 animate-pulse rounded-[1.25rem] bg-muted"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
