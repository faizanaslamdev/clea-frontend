import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';

export default function PartnerSection() {
  return (
    <section
      aria-label={`Samarbeid med ${BRAND.name}`}
      className="section-shell section-container"
    >
      <div className="flex flex-col overflow-hidden rounded-[16px] md:flex-row bg-card">
        <div className="relative aspect-square w-full flex-shrink-0 md:w-auto md:min-w-[400px] lg:min-w-[500px]">
          <Image
            src="/products/dress.jpg"
            alt={`Samarbeid med ${BRAND.name}`}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex w-full flex-col justify-center gap-7 bg-muted px-8 py-12 md:flex-1 md:gap-[28px] md:px-[80px] md:py-[80px] lg:px-[110px]">
          <p className="type-eyebrow text-muted-foreground">FOR MERKER</p>

          <h2 className="type-heading">Oppdag og belønn toppshoppere</h2>

          <p className="type-subheading max-w-[720px]">
            Vis frem produktene dine i trending-feeds, eksklusive tilbud og
            kuraterte samlinger som driver kjøp.
          </p>

          <div className="w-fit">
            <Link
              href="/partner"
              className="group inline-flex items-center gap-2 border-b border-foreground text-foreground transition-opacity hover:opacity-80"
            >
              <span className="type-link">Les mer</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
