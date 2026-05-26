'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProductCarousel, type ProductCarouselHandle } from '@/components/product-carousel';
import { LoadingBlock } from '@/components/shared/loading-block';
import { Button } from '@/components/ui/button';
import { BRAND } from '@/lib/constants/brand';
import { useFeaturedProducts } from '@/lib/hooks/useProducts';

export function TrendingSection() {
  const carouselRef = useRef<ProductCarouselHandle>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const { data: products = [], isLoading } = useFeaturedProducts();

  const handleScrollState = useCallback(
    (state: { canScrollLeft: boolean; canScrollRight: boolean }) => {
      setCanLeft(state.canScrollLeft);
      setCanRight(state.canScrollRight);
    },
    [],
  );

  if (isLoading) {
    return <LoadingBlock className="section-container h-96" />;
  }

  return (
    <section className="overflow-x-hidden">
      <div className="section-container mb-6 flex items-center justify-between">
        <h2 className="type-heading">Trending Now</h2>
        <Link href="/brands" aria-label="See all" className="md:hidden">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full size-6 bg-muted border-none"
          >
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>

      <div className="section-container mb-6 hidden md:flex items-center justify-between">
        <p className="type-subheading">
          Popular fashion picks — compare prices on {BRAND.domain}
        </p>
        <div className="flex items-center gap-4">
          <Link href="/brands" className="type-link">
            See all
          </Link>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Scroll left"
              disabled={!canLeft}
              onClick={() => carouselRef.current?.scrollLeft()}
              className="rounded-full size-7 bg-muted hover:bg-muted/80 disabled:opacity-30"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Scroll right"
              disabled={!canRight}
              onClick={() => carouselRef.current?.scrollRight()}
              className="rounded-full size-7 bg-muted hover:bg-muted/80 disabled:opacity-30"
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="section-container">
        <ProductCarousel
          ref={carouselRef}
          products={products}
          hideControls
          onScrollStateChange={handleScrollState}
        />
      </div>
    </section>
  );
}
