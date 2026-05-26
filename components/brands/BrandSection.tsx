'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useFeaturedStores } from '@/lib/hooks/useStores';
import BrandGrid from './BrandGrid';

export default function BrandSection() {
  const { data: brands = [] } = useFeaturedStores();

  return (
    <section id="brands" className="section-container section-shell scroll-mt-20">
      <div className="mb-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="type-heading">Explore brands</h2>
          <p className="type-subheading md:max-w-[35%] md:text-right">
            Explore top-tier products from brands you know and discover new
            brands you&apos;ll love.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="type-eyebrow">Trending brands</h3>

          <Link
            href="/brands"
            className="flex items-center gap-1 border-b border-foreground"
          >
            <span className="type-link">See all</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <BrandGrid brands={brands} />
    </section>
  );
}
