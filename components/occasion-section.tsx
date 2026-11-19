'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchOccasionCovers } from '@/lib/api/occasion-covers';
import { HOME_OCCASIONS } from '@/lib/constants/occasions';
import { navigateToChatEntry } from '@/lib/chat/chat-entry';
import { useHomeAudience } from '@/lib/home-audience';
import { productKeys } from '@/lib/query/keys';
import { STALE_TIME_STATIC_MS } from '@/lib/query/client';
import { RemoteProductImage } from '@/components/product/remote-product-image';

/**
 * "Kle deg for anledningen": the app's one-click occasions on the homepage.
 * Each tile sends its question to the stylist, with the hero's Dame/Herre.
 * Covers come from the catalog for that audience; before a choice, dame.
 */
export function OccasionSection() {
  const router = useRouter();
  const audience = useHomeAudience();
  const shopCategory = audience ?? 'womens';
  const { data } = useQuery({
    queryKey: productKeys.occasionCovers(shopCategory),
    queryFn: () => fetchOccasionCovers(shopCategory),
    staleTime: STALE_TIME_STATIC_MS,
    placeholderData: keepPreviousData,
  });
  const covers = data ?? HOME_OCCASIONS.map((occasion) => ({ occasion, product: null }));

  return (
    <section className="section-shell occasion-section" aria-labelledby="occasion-heading">
      <div className="section-container mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
        <div className="flex flex-col gap-2">
          <p className="type-eyebrow">Anledning</p>
          <h2 id="occasion-heading" className="type-heading-section">
            Kle deg for anledningen
          </h2>
        </div>
        <p className="font-sans text-sm text-muted-foreground">Ett trykk – Clea setter sammen antrekket.</p>
      </div>
      <div className="section-container">
        <div className="occasion-grid" role="list">
          {covers.map(({ occasion, product }) => (
            <button
              key={occasion.id}
              type="button"
              role="listitem"
              className="occasion-card"
              onClick={() =>
                navigateToChatEntry(router, { query: occasion.prompt, shopCategory: audience })
              }
              aria-label={`${occasion.label}: ${occasion.prompt}`}
            >
              <span className="occasion-card__photo">
                {product ? (
                  <RemoteProductImage
                    src={product.image}
                    alt=""
                    role="card"
                    merchantId={product.merchantId}
                    merchantName={product.merchantName}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="occasion-card__image"
                  />
                ) : null}
              </span>
              <span className="occasion-card__text">
                <span className="occasion-card__label">{occasion.label}</span>
                <span className="occasion-card__prompt">{occasion.prompt}</span>
              </span>
              <ArrowRight aria-hidden className="occasion-card__arrow" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
