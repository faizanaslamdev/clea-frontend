'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useQueries } from '@tanstack/react-query';
import type { ShopCategory, ProductFamily } from '@/lib/api/chat-types';
import {
  fetchSearchByCardPhoto,
  type SearchByPhotoParams,
} from '@/lib/api/products';
import { navigateToChatEntry } from '@/lib/chat/chat-entry';
import { useCategoryPreviews } from '@/lib/hooks/useProducts';
import { STALE_TIME_STATIC_MS } from '@/lib/query/client';

interface SearchByCard {
  eyebrow: string;
  query: string;
  shopCategory: ShopCategory;
  /** Which category's accent gradient backs this card. */
  family: ProductFamily;
  /** Catalog lookup so the floating photo matches the example query. */
  photo: SearchByPhotoParams;
}

const SEARCH_BY_CARDS: readonly SearchByCard[] = [
  {
    eyebrow: 'Søk etter anledning',
    query: 'Bryllupsgjest-kjole til en sommerfest i Sørlandet',
    shopCategory: 'womens',
    family: 'dresses',
    photo: {
      productFamily: 'dresses',
      q: 'kjole',
      nameHint: /dress|kjole|midi|pleat|embroider/i,
      nameAvoid: /sandal|skirt|skjørt|slide/i,
    },
  },
  {
    eyebrow: 'Søk etter trend',
    query: 'Finn meg ferieklare sandaler til sommeren',
    shopCategory: 'womens',
    family: 'footwear',
    photo: {
      brand: 'nelly',
      q: 'sandal',
      nameHint: /sandal|flip.?flop|strap/i,
      nameAvoid: /boot|shoe|sneaker|kids|barn|hoka|mizuno/i,
    },
  },
  {
    eyebrow: 'Søk etter merke',
    query: 'Vis meg alt fra Ralph Lauren, på tvers av butikker',
    shopCategory: 'mens',
    family: 'tops',
    photo: {
      brand: 'Ralph Lauren',
      q: 'polo',
      nameHint: /polo|shirt|oxford|cable|mesh/i,
      nameAvoid: /blanket|scarf|eau de|perfume|backpack|bloomer/i,
    },
  },
  {
    eyebrow: 'Søk etter pris',
    query: 'Vinterjakke til herre under 1500 kr',
    shopCategory: 'mens',
    family: 'outerwear',
    photo: {
      q: 'vinterjakke',
      suitableFor: 'male',
      maxPrice: 1500,
      nameHint: /jakke|jacket|puffer|down|insulated/i,
      nameAvoid: /fleece|hoodie|vest|gilet|women|dame/i,
    },
  },
];

/** Neutral fallback while category accents are still loading. */
const FALLBACK_GRADIENT = { from: '#3f3f46', to: '#18181b' };

export function SearchBySection() {
  const router = useRouter();
  const { data: categories = [] } = useCategoryPreviews();
  const previewByFamily = new Map(
    categories.map((category) => [category.family, category]),
  );

  const photoQueries = useQueries({
    queries: SEARCH_BY_CARDS.map((card) => ({
      queryKey: ['products', 'search-by-photo', card.eyebrow, card.photo] as const,
      queryFn: () => fetchSearchByCardPhoto(card.photo),
      staleTime: STALE_TIME_STATIC_MS,
    })),
  });

  return (
    <section aria-labelledby="search-by-heading" className="section-shell section-container">
      <div className="mb-8 flex flex-col gap-2 md:mb-10">
        <h2 id="search-by-heading" className="type-heading-section">
          Fortell oss hva du er ute etter.
        </h2>
        <p className="type-subheading max-w-[520px]">
          Noen eksempler på hvordan andre bruker AI-søket — anledning, trend, merke eller budsjett.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
        {SEARCH_BY_CARDS.map((card, index) => {
          const preview = previewByFamily.get(card.family);
          const accent = preview
            ? { from: preview.accentFrom, to: preview.accentTo }
            : FALLBACK_GRADIENT;
          // Prefer a photo that actually matches the example query; fall
          // back to the category tile hero if the dedicated fetch is empty.
          const photoSrc =
            photoQueries[index]?.data ?? preview?.images[0] ?? null;

          return (
            <button
              key={card.eyebrow}
              type="button"
              onClick={() =>
                navigateToChatEntry(router, {
                  query: card.query,
                  shopCategory: card.shopCategory,
                })
              }
              style={{ '--cat-from': accent.from, '--cat-to': accent.to } as CSSProperties}
              className="search-by-card group relative flex min-h-[220px] items-stretch gap-5 overflow-hidden rounded-[1.25rem] p-8 text-left md:gap-6 md:p-10"
            >
              <div className="relative flex flex-1 flex-col justify-between gap-8">
                <p className="search-by-card__eyebrow">{card.eyebrow}</p>

                <div className="flex items-end justify-between gap-4">
                  <p className="search-by-card__query">{card.query}</p>

                  <span className="search-by-card__arrow">
                    <ArrowUpRight className="size-4" aria-hidden />
                  </span>
                </div>
              </div>

              {photoSrc && (
                <div className="search-by-card__photo" aria-hidden>
                  <Image src={photoSrc} alt="" fill className="object-cover" sizes="140px" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
