'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ProductCarouselProps = {
  products: Product[];
  className?: string;
};

export function ProductCarousel({ products, className }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [products.length, updateScrollState]);

  const scrollByOne = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;

    const firstSlide = el.querySelector<HTMLElement>('[data-product-slide]');
    if (!firstSlide) return;

    const gap = 24; // gap-6
    const distance = firstSlide.offsetWidth + gap;

    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  }, []);

  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        No trending products right now.
      </p>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Arrows — desktop / tablet; swipe works on track */}
      {products.length > 3 && (
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 hidden md:block">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Scroll left"
            disabled={!canScrollLeft}
            onClick={() => scrollByOne('left')}
            className="pointer-events-auto absolute left-0 top-1/2 size-10 -translate-y-1/2 border-border bg-card/95 shadow-sm backdrop-blur-sm disabled:opacity-30"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Scroll right"
            disabled={!canScrollRight}
            onClick={() => scrollByOne('right')}
            className="pointer-events-auto absolute right-0 top-1/2 size-10 -translate-y-1/2 border-border bg-card/95 shadow-sm backdrop-blur-sm disabled:opacity-30"
          >
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      {/* Scroll track */}
      <div
        ref={scrollRef}
        className={cn(
          'flex gap-6 overflow-x-auto scroll-smooth pb-2',
          'snap-x snap-mandatory',
          /* hide scrollbar — Nordic, clean */
          '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'touch-pan-x'
        )}
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-product-slide
            className={cn(
              'shrink-0 snap-start',
              /* mobile: ~1 card + peek */
              'w-[85%] sm:w-[calc(50%-12px)]',
              /* desktop: exactly 3 visible */
              'lg:w-[calc((100%-3rem)/3)]'
            )}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/trending"
          className="inline-flex items-center gap-1 border-b border-foreground pb-0.5 text-sm font-medium text-foreground transition-opacity hover:opacity-70 group"
        >
          View all trending
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}