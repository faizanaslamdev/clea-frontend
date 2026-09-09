'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { navigateToChatEntry } from '@/lib/chat/chat-entry';
import { useTrendingLooks } from '@/lib/hooks/useProducts';
import type { ShopCategory, SuitableFor } from '@/lib/api/chat-types';
import type { Product } from '@/lib/types';

interface ShopTrendingSectionProps {
  suitableFor: SuitableFor;
  shopCategory?: ShopCategory;
}

/**
 * "Populært akkurat nå" -- 3 big single-product magazine cards, gender
 * filtered (studied from daydream.ing's own "Trending Now" section: three
 * large photos + a small caption below, no product grid). Clicking a card
 * lands in chat on that exact item, same as every other launcher on this
 * page (category chips, "Top categories" fan cards).
 */
export function ShopTrendingSection({ suitableFor, shopCategory }: ShopTrendingSectionProps) {
  const router = useRouter();
  const { data: products = [], isLoading } = useTrendingLooks(suitableFor);

  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="shop-trending-heading"
      className="scroll-mt-20 pb-16"
    >
      <div className="section-container">
        <div className="mb-8 flex flex-col gap-2 md:mb-10">
          <p className="type-eyebrow">Trender</p>
          <h2 id="shop-trending-heading" className="type-heading-section">
            Populært akkurat nå
          </h2>
          <p className="type-subheading">Det andre handler etter akkurat nå.</p>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }, (_, index) => (
                <div key={index} aria-hidden>
                  <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-muted" />
                </div>
              ))
            : products.map((product) => (
                <ShopTrendingCard
                  key={product.id}
                  product={product}
                  onSelect={() =>
                    navigateToChatEntry(router, {
                      query: `Vis meg ${product.name}`,
                      shopCategory,
                    })
                  }
                />
              ))}
        </div>
      </div>
    </section>
  );
}

function ShopTrendingCard({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: () => void;
}) {
  return (
    <button type="button" onClick={onSelect} className="group flex flex-col text-left">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(min-width: 640px) 33vw, 100vw"
        />
      </div>
      <p className="type-eyebrow mt-4">{product.merchantName ?? product.brand}</p>
      <h3 className="mt-1.5 line-clamp-2 font-serif text-xl font-normal leading-snug text-foreground md:text-2xl">
        {product.name}
      </h3>
      <span className="mt-3 inline-flex items-center gap-1.5 whitespace-nowrap font-sans text-sm font-medium text-foreground underline-offset-4 group-hover:underline">
        Se i chat
        <ArrowUpRight className="size-3.5" aria-hidden />
      </span>
    </button>
  );
}
