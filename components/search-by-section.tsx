'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { ShopCategory, ProductFamily } from '@/lib/api/chat-types';
import { navigateToChatEntry } from '@/lib/chat/chat-entry';
import { useCategoryPreviews } from '@/lib/hooks/useProducts';

interface SearchByCard {
  eyebrow: string;
  query: string;
  shopCategory: ShopCategory;
  /** Which category's accent gradient backs this card -- ties the visual to
   * what the query is actually about instead of a flat placeholder. */
  family: ProductFamily;
}

const SEARCH_BY_CARDS: readonly SearchByCard[] = [
  {
    eyebrow: 'Søk etter anledning',
    query: 'Bryllupsgjest-kjole til en sommerfest i Sørlandet',
    shopCategory: 'womens',
    family: 'dresses',
  },
  {
    eyebrow: 'Søk etter trend',
    query: 'Finn meg ferieklare sandaler til sommeren',
    shopCategory: 'womens',
    family: 'footwear',
  },
  {
    eyebrow: 'Søk etter merke',
    query: 'Vis meg alt fra Ralph Lauren, på tvers av butikker',
    shopCategory: 'mens',
    family: 'tops',
  },
  {
    eyebrow: 'Søk etter pris',
    query: 'Vinterjakke til herre under 1500 kr',
    shopCategory: 'mens',
    family: 'outerwear',
  },
];

/** Neutral fallback while category accents are still loading. */
const FALLBACK_GRADIENT = { from: '#3f3f46', to: '#18181b' };

export function SearchBySection() {
  const router = useRouter();
  const { data: categories = [] } = useCategoryPreviews();
  const previewByFamily = new Map(categories.map((category) => [category.family, category]));

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
        {SEARCH_BY_CARDS.map((card) => {
          const preview = previewByFamily.get(card.family);
          const accent = preview
            ? { from: preview.accentFrom, to: preview.accentTo }
            : FALLBACK_GRADIENT;
          // Reuses one of the category's own spare photos (index 3+, the
          // same headroom FeatureTabsSection draws from -- see
          // CategoryPreview's doc comment) so the card gets a real product
          // photo instead of a flat color block, without repeating the
          // exact images CategorySection already shows just above it.
          const photoSrc = preview?.images[3] ?? preview?.images[0];

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
