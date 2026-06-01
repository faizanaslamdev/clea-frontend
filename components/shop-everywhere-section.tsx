import Image from 'next/image';
import { PromoTestimonialRotator } from '@/components/promo-testimonial-rotator';
import { BRAND } from '@/lib/constants/brand';

const PROMO_IMAGE = '/promo/shop-everywhere.jpg';

export function ShopEverywhereSection() {
  return (
    <section
      aria-labelledby="shop-everywhere-heading"
      className="section-shell section-container"
    >
      <div className="promo-panel flex flex-col md:flex-row">
        <div className="flex w-full flex-col justify-center gap-6 bg-muted px-8 py-12 md:min-h-[520px] md:flex-1 md:gap-7 md:px-16 md:py-16 lg:px-20 lg:py-20">
          <p className="type-eyebrow text-muted-foreground">
            Sammenlign på {BRAND.domain}
          </p>

          <h2
            id="shop-everywhere-heading"
            className="type-heading max-w-[14ch] text-balance"
          >
            Bruk {BRAND.name} uansett hvor du handler
          </h2>

          <p className="type-subheading max-w-[520px]">
            Følg priser, sammenlign forhandlere side om side, og lagre
            favoritter — rett i nettleseren. Ingen app å installere, bare
            smartere shopping når du trenger det.
          </p>
        </div>

        <div className="relative min-h-[380px] w-full md:min-h-[520px] md:min-w-[45%] md:max-w-[52%] md:flex-1">
          <Image
            src={PROMO_IMAGE}
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 52vw"
          />
          <div className="promo-panel__image-fade" aria-hidden />

          <div className="absolute inset-x-0 bottom-0 z-10">
            <PromoTestimonialRotator />
          </div>
        </div>
      </div>
    </section>
  );
}
