'use client';

import Link from 'next/link';
import { HOME_COLOURS } from '@/lib/constants/occasions';
import { useAudience } from '@/lib/audience/audience';
import { SHOP_COLOUR_OPTIONS } from '@/lib/shop/shop-colours';

/**
 * "Handle etter farge": the app's colour row. Each dot opens the
 * all-clothes shelf filtered to that colour family, for the hero's audience.
 */
export function ColourSection() {
  const audience = useAudience();
  const gender = audience === 'mens' ? 'herre' : 'dame';
  const options = HOME_COLOURS.map((value) => SHOP_COLOUR_OPTIONS.find((o) => o.value === value)).filter(
    (o): o is NonNullable<typeof o> => Boolean(o),
  );

  return (
    <section className="section-shell colour-section" aria-labelledby="colour-heading">
      <div className="section-container mb-8 flex flex-col gap-2 md:mb-10">
        <p className="type-eyebrow">Farge</p>
        <h2 id="colour-heading" className="type-heading-section">
          Handle etter farge
        </h2>
      </div>
      <div className="section-container">
        <ul className="colour-row">
          {options.map((option) => (
            <li key={option.value}>
              <Link
                href={`/shop/alt?gender=${gender}&farge=${option.value}`}
                className="colour-item"
                prefetch={false}
              >
                <span className="colour-item__dot" style={{ background: option.swatch }} aria-hidden />
                {option.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
