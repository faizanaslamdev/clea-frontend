'use client';

import { useAllStores } from '@/lib/hooks/useStores';

/**
 * Slim, slow-scrolling wordmark strip — a trust signal ("who we cover")
 * distinct from the full BrandGrid below it. Driven by the same live store
 * list as /brands, so it grows automatically as more affiliate stores get
 * approved rather than hard-coding today's 8 partners.
 *
 * Renders the real list tripled back-to-back so the loop point stays
 * seamless even with a short brand list.
 */
export function BrandMarquee() {
  const { data: stores = [], isLoading } = useAllStores();

  if (isLoading || stores.length === 0) {
    return null;
  }

  const names = stores.map((store) => store.name);
  const loop = [...names, ...names, ...names];

  return (
    <div className="brand-marquee" aria-hidden="true">
      <div className="brand-marquee__track">
        {loop.map((name, index) => (
          <span className="brand-marquee__item" key={`${name}-${index}`}>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
