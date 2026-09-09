'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { navigateToChatEntry } from '@/lib/chat/chat-entry';
import { useCategoryPreviews } from '@/lib/hooks/useProducts';
import { CATEGORY_GRID_ENTRIES } from '@/lib/constants/category-grid';
import type { CategoryPreview } from '@/lib/api/products';
import type { ProductFamily } from '@/lib/api/chat-types';

/** Packshot-heavy tiles: contain so products aren't cropped in the 3:4 frame. */
const CONTAIN_FIT_FAMILIES = new Set<ProductFamily>([
  'tops',
  'knitwear',
  'bottoms',
  'gloves',
  'footwear',
]);

export function CategorySection() {
  const router = useRouter();
  const { data: categories = [], isLoading } = useCategoryPreviews();

  if (!isLoading && categories.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="category-grid-heading"
      className="section-shell scroll-mt-20"
      aria-busy={isLoading}
    >
      <div className="section-container mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
        <div className="flex flex-col gap-2">
          <p className="type-eyebrow">Kategorier</p>
          <h2 id="category-grid-heading" className="type-heading-section">
            Hva leter du etter?
          </h2>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 whitespace-nowrap font-sans text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Se hele utvalget
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      <div className="category-carousel__track" role="list">
        {isLoading
          ? CATEGORY_GRID_ENTRIES.map((entry) => (
              <div
                key={entry.label}
                role="listitem"
                className="category-fan-card category-fan-card--skeleton snap-start shrink-0"
                style={
                  {
                    '--cat-from': entry.accentFrom,
                    '--cat-to': entry.accentTo,
                  } as React.CSSProperties
                }
              >
                <div className="category-fan-card__stack">
                  <div className="category-fan-card__photo category-fan-card__photo--center category-fan-card__photo--skeleton" />
                </div>
              </div>
            ))
          : categories.map((category) => (
              <CategoryFanCard
                key={category.label}
                category={category}
                onSelect={() =>
                  navigateToChatEntry(router, { query: category.query })
                }
              />
            ))}
      </div>
    </section>
  );
}

function CategoryFanCard({
  category,
  onSelect,
}: {
  category: CategoryPreview;
  onSelect: () => void;
}) {
  const [center, left, right] = category.images;
  // Packshot-heavy families look cropped/broken with object-cover in the
  // 3:4 fan frame — contain keeps the full product on the white plate.
  const imageFit = CONTAIN_FIT_FAMILIES.has(category.family)
    ? 'object-contain'
    : 'object-cover';

  return (
    <button
      type="button"
      role="listitem"
      onClick={onSelect}
      className="category-fan-card group snap-start shrink-0 text-left"
      style={
        {
          '--cat-from': category.accentFrom,
          '--cat-to': category.accentTo,
        } as React.CSSProperties
      }
    >
      <p className="category-fan-card__eyebrow">Kategori</p>
      <h3 className="category-fan-card__label">{category.label}</h3>

      <div className="category-fan-card__stack">
        {left ? (
          <div className="category-fan-card__photo category-fan-card__photo--left">
            <Image
              src={left}
              alt=""
              fill
              className={`${imageFit} object-center`}
              sizes="140px"
            />
          </div>
        ) : null}
        {right ? (
          <div className="category-fan-card__photo category-fan-card__photo--right">
            <Image
              src={right}
              alt=""
              fill
              className={`${imageFit} object-center`}
              sizes="140px"
            />
          </div>
        ) : null}
        <div className="category-fan-card__photo category-fan-card__photo--center">
          <Image
            src={center}
            alt={category.label}
            fill
            className={`${imageFit} object-center`}
            sizes="180px"
          />
        </div>
      </div>
    </button>
  );
}
