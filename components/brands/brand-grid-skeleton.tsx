export function BrandGridSkeleton() {
  // Matches the five-card editorial layout: 2 / 2 / 1.
  const cardsPerColumn = [2, 2, 1] as const;

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
