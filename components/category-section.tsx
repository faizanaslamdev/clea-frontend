'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navigateToChatEntry } from '@/lib/chat/chat-entry';
import { useCategoryPreviews } from '@/lib/hooks/useProducts';
import {
  CATEGORY_GRID_ENTRIES,
  categoryGridForShop,
} from '@/lib/constants/category-grid';
import type { CategoryPreview } from '@/lib/api/products';
import type { ProductFamily, ShopCategory, SuitableFor } from '@/lib/api/chat-types';

/** Packshot-heavy tiles: contain so products aren't cropped in the 3:4 frame. */
const CONTAIN_FIT_FAMILIES = new Set<ProductFamily>(['gloves']);

interface CategorySectionProps {
  /** Hides the "Se hele utvalget" link to /shop -- pass false when this
   * section is already being rendered ON /shop itself, where a link back
   * to the current page would be pointless. Defaults to true so the
   * homepage (the only existing caller) renders exactly as before. */
  showLink?: boolean;
  /** Filters tile preview photos (and underlying inventory) to one
   * audience -- wired up from the Dame/Herre toggle on /shop. Omitted
   * (or undefined) shows the unfiltered "Alle" mix, matching the
   * homepage's existing behavior. On /shop this also selects the
   * gender-specific category list (equal card count, Daydream pattern). */
  suitableFor?: SuitableFor;
  /** Carried into the chat query on tile click so it continues the same
   * gendered browsing context set by /shop's Dame/Herre toggle. */
  shopCategory?: ShopCategory;
  /** Tighter vertical rhythm for /shop, where this sits between a chip row
   * and another section rather than standing alone on the homepage.
   * .section-shell's 96px top+bottom would stack with the next section's
   * own 96px into a 192px void -- daydream.ing's shop page runs ~32-56px
   * between these blocks (measured on the live site). */
  compact?: boolean;
  /** 'carousel' (default) is the homepage's swipeable row. 'grid' wraps the
   * cards into rows instead -- what /shop wants, matching daydream.ing's own
   * shop page, where every category is visible at once rather than hidden
   * behind a sideways scroll. */
  layout?: 'carousel' | 'grid';
}

export function CategorySection({
  showLink = true,
  suitableFor,
  shopCategory,
  compact = false,
  layout = 'carousel',
}: CategorySectionProps = {}) {
  const router = useRouter();
  const { data: categories = [], isLoading } = useCategoryPreviews(suitableFor);
  const skeletonEntries = suitableFor
    ? categoryGridForShop(suitableFor)
    : CATEGORY_GRID_ENTRIES;
  const eyebrow =
    shopCategory === 'mens'
      ? 'Herreklær'
      : shopCategory === 'womens'
        ? 'Dameklær'
        : 'Kategori';

  if (!isLoading && categories.length === 0) {
    return null;
  }

  const cards = (
    <>
          {isLoading
            ? skeletonEntries.map((entry) => (
                <div
                  key={entry.id}
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
                  key={category.id}
                  category={category}
                  eyebrow={eyebrow}
                  onSelect={() =>
                    navigateToChatEntry(router, { query: category.query, shopCategory })
                  }
                />
              ))}
    </>
  );

  return (
    <section
      aria-labelledby="category-grid-heading"
      className={cn(
        'scroll-mt-20',
        compact ? 'pt-8 pb-10 md:pt-12 md:pb-14' : 'section-shell',
      )}
      aria-busy={isLoading}
    >
      <div className="section-container mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
        <div className="flex flex-col gap-2">
          <p className="type-eyebrow">Kategorier</p>
          <h2 id="category-grid-heading" className="type-heading-section">
            Hva leter du etter?
          </h2>
        </div>
        {showLink && (
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 whitespace-nowrap font-sans text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Se hele utvalget
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>

      {layout === 'grid' ? (
        /* Grid mode sits inside the normal page gutters; the carousel
           deliberately bleeds past them, so it brings its own. */
        <div className="section-container">
          <div
            className="category-carousel__track category-carousel__track--grid"
            role="list"
          >
            {cards}
          </div>
        </div>
      ) : (
        <div className="category-carousel__track" role="list">
          {cards}
        </div>
      )}
    </section>
  );
}

function CategoryFanCard({
  category,
  eyebrow,
  onSelect,
}: {
  category: CategoryPreview;
  eyebrow: string;
  onSelect: () => void;
}) {
  const [center, left, right] = category.images;
  // Packshot-heavy families look cropped/broken with object-cover in the
  // 3:4 fan frame — contain keeps the full product on the white plate.
  const imageFit =
    category.family && CONTAIN_FIT_FAMILIES.has(category.family)
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
      <p className="category-fan-card__eyebrow">{eyebrow}</p>
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
