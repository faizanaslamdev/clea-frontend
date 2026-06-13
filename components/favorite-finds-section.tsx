import Image from 'next/image';
import { cn } from '@/lib/utils';

/** Full card artwork (2×2 grid + labels), 997×1265px source */
const COLLECTION_CARDS = [
  {
    src: '/collections/collection-fall-faves.png',
    alt: 'Høstfavoritter — 44 produkter',
    rotate: -4,
    overlap: 0,
    zIndex: 1,
  },
  {
    src: '/collections/collection-winter-layers.png',
    alt: 'Vinterlag — 23 produkter',
    rotate: -1.5,
    overlap: -56,
    zIndex: 2,
  },
  {
    src: '/collections/collection-holiday-wishlist.png',
    alt: 'Juleønskeliste — 104 produkter',
    rotate: 1.5,
    overlap: -56,
    zIndex: 3,
  },
  {
    src: '/collections/collection-going-out.png',
    alt: 'Ut på byen — 96 produkter',
    rotate: 4.5,
    overlap: -56,
    zIndex: 4,
  },
] as const;

export function FavoriteFindsSection() {
  return (
    <section
      aria-labelledby="favorite-finds-heading"
      className="section-shell bg-background"
    >
      <div className="section-container">
        <div className="layout-inner-wide text-center">
          <h2
            id="favorite-finds-heading"
            className="font-serif text-[40px] font-light leading-[1.1] tracking-tight text-foreground md:text-[56px] md:leading-[1.15]"
          >
            Lagre <em className="italic">favorittfunnene</em> dine.
          </h2>
          <p className="mx-auto mt-5 max-w-[420px] text-base font-light leading-6 text-muted-foreground md:mt-6">
            Organiser de beste funnene i samlinger. Få varsel når prisen faller.
          </p>
        </div>

        {/* Extra vertical padding so soft shadows are not clipped */}
        <div className="mt-14 flex justify-center px-4 py-10 md:mt-16 md:py-12 lg:mt-20">
          <div
            className="flex origin-bottom scale-[0.62] items-end justify-center min-[420px]:scale-[0.75] sm:scale-[0.88] md:scale-100"
            role="list"
            aria-label="Eksempelsamlinger"
          >
            {COLLECTION_CARDS.map((card, index) => (
              <div
                key={card.src}
                role="listitem"
                className={cn(
                  'relative shrink-0 will-change-transform',
                  index >= 2 && 'hidden lg:block',
                )}
                style={{
                  zIndex: card.zIndex,
                  marginLeft: card.overlap,
                  transform: `rotate(${card.rotate}deg)`,
                }}
              >
                <div className="collection-card w-[200px] sm:w-[228px] md:w-[248px]">
                  <Image
                    src={card.src}
                    alt={card.alt}
                    width={997}
                    height={1265}
                    className="collection-card__image"
                    sizes="(max-width: 640px) 200px, (max-width: 768px) 228px, 248px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
