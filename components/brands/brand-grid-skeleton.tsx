export function BrandGridSkeleton() {
  // Matches the current six-card editorial layout on home and `/brands`.
  const cardsPerColumn = [2, 2, 2] as const;

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
