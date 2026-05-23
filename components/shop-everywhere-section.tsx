import Image from 'next/image';
import { Star } from 'lucide-react';

const PROMO_IMAGE = '/promo/shop-everywhere.jpg';

const TESTIMONIAL = {
  quote:
    'Finally, a tool that helps me shop smarter without the noise — real price insights, not ads. Whether it\'s everyday fashion or a splurge, I know I\'m buying at the right time with data on what actually holds its value.',
  author: 'Ari L.',
};

export function ShopEverywhereSection() {
  return (
    <section
      aria-labelledby="shop-everywhere-heading"
      className="section-shell section-container"
    >
      <div className="promo-panel flex flex-col md:flex-row">
        {/* Copy */}
        <div className="flex w-full flex-col justify-center gap-6 bg-muted px-8 py-12 md:min-h-[520px] md:flex-1 md:gap-7 md:px-16 md:py-16 lg:px-20 lg:py-20">
          <p className="type-eyebrow text-muted-foreground">
            Compare across Nordic stores
          </p>

          <h2
            id="shop-everywhere-heading"
            className="type-heading max-w-[14ch] text-balance"
          >
            Use Nordic Price wherever you shop
          </h2>

          <p className="type-subheading max-w-[520px]">
            Track prices, compare retailers side by side, and save your favorite
            finds — right in your browser. No app to install, just smarter
            shopping when you need it.
          </p>
        </div>

        {/* Image + testimonial */}
        <div className="relative min-h-[380px] w-full md:min-h-[520px] md:min-w-[45%] md:max-w-[52%] md:flex-1">
          <Image
            src={PROMO_IMAGE}
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 52vw"
          />
          <div className="promo-panel__image-fade" aria-hidden />

          <figure className="absolute inset-x-0 bottom-0 z-10 px-8 pb-8 pt-16 md:px-10 md:pb-10 lg:px-12 lg:pb-12">
            <blockquote className="max-w-[420px] text-sm font-light leading-relaxed text-foreground md:text-[15px] md:leading-6">
              &ldquo;{TESTIMONIAL.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4">
              <p className="text-sm font-semibold text-foreground">
                {TESTIMONIAL.author}
              </p>
              <div
                className="mt-1.5 flex gap-0.5"
                aria-label="5 out of 5 stars"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-3.5 fill-muted-foreground text-muted-foreground"
                    aria-hidden
                  />
                ))}
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
