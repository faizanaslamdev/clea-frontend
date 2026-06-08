'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProductCarousel, type ProductCarouselHandle } from '@/components/product-carousel';
import { LoadingBlock } from '@/components/shared/loading-block';
import { Button } from '@/components/ui/button';
import { BRAND } from '@/lib/constants/brand';
import {
  POPULAR_PRODUCTS_MERCHANT_NAME,
  POPULAR_PRODUCTS_MERCHANT_SLUG,
} from '@/lib/constants/featured';
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
        <h2 className="type-heading">Populært nå</h2>
        <Link
          href={`/brands/${POPULAR_PRODUCTS_MERCHANT_SLUG}`}
          aria-label={`Se alle fra ${POPULAR_PRODUCTS_MERCHANT_NAME}`}
          className="md:hidden"
        >
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
          Populære valg fra {POPULAR_PRODUCTS_MERCHANT_NAME} — sammenlign priser
          på {BRAND.domain}
        </p>
        <div className="flex items-center gap-4">
          <Link
            href={`/brands/${POPULAR_PRODUCTS_MERCHANT_SLUG}`}
            className="type-link"
          >
            Se alle
          </Link>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Rull til venstre"
              disabled={!canLeft}
              onClick={() => carouselRef.current?.scrollLeft()}
              className="rounded-full size-7 bg-muted hover:bg-muted/80 disabled:opacity-30"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Rull til høyre"
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
