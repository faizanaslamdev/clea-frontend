'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { ArrowLeft, ArrowRight } from 'lucide-react';

import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ProductCarouselHandle {
  scrollLeft: () => void;
  scrollRight: () => void;
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

type CarouselScrollState = {
  canScrollLeft: boolean;
  canScrollRight: boolean;
};

type ProductCarouselProps = {
  products: Product[];
  className?: string;
  hideControls?: boolean;
  onScrollStateChange?: (state: CarouselScrollState) => void;
};

export const ProductCarousel = forwardRef<
  ProductCarouselHandle,
  ProductCarouselProps
>(({ products, className, hideControls = false, onScrollStateChange }, ref) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // controls initial padding visibility
  const [isAtStart, setIsAtStart] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;

    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;

    const nextLeft = scrollLeft > 4;
    const nextRight = scrollLeft + clientWidth < scrollWidth - 4;

    setCanScrollLeft(nextLeft);
    setCanScrollRight(nextRight);
    setIsAtStart(scrollLeft <= 4);
    onScrollStateChange?.({
      canScrollLeft: nextLeft,
      canScrollRight: nextRight,
    });
  }, [onScrollStateChange]);

  useEffect(() => {
    const el = scrollRef.current;

    if (!el) return;

    updateScrollState();

    el.addEventListener('scroll', updateScrollState, {
      passive: true,
    });

    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [products.length, updateScrollState]);

  const scrollByOne = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;

    if (!el) return;

    const firstSlide =
      el.querySelector<HTMLElement>('[data-product-slide]');

    if (!firstSlide) return;

    const distance = firstSlide.offsetWidth + 16;

    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      scrollLeft: () => scrollByOne('left'),
      scrollRight: () => scrollByOne('right'),
      canScrollLeft,
      canScrollRight,
    }),
    [scrollByOne, canScrollLeft, canScrollRight]
  );

  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        No trending products right now.
      </p>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* desktop overlay controls */}
      {!hideControls && products.length > 3 && (
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 hidden md:block">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Scroll left"
            disabled={!canScrollLeft}
            onClick={() => scrollByOne('left')}
            className={cn(
              'pointer-events-auto absolute left-6 top-1/2',
              'size-9 -translate-y-1/2 rounded-full',
              'border-border bg-card/95 backdrop-blur-sm',
              'shadow-sm transition-opacity',
              'disabled:opacity-30'
            )}
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
            className={cn(
              'pointer-events-auto absolute right-6 top-1/2',
              'size-9 -translate-y-1/2 rounded-full',
              'border-border bg-card/95 backdrop-blur-sm',
              'shadow-sm transition-opacity',
              'disabled:opacity-30'
            )}
          >
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
{/* carousel */}
<div
  ref={scrollRef}
  className={cn(
    'flex overflow-x-auto py-3 pb-6',
    'gap-4 scroll-smooth snap-x snap-mandatory',
    '[-ms-overflow-style:none]',
    '[scrollbar-width:none]',
    '[&::-webkit-scrollbar]:hidden',
    'touch-pan-x',
  
    className
  )}
>
  {/* leading spacer — matches section-container padding exactly */}
  <div className="shrink-0 w-5 md:w-6 lg:w-10 xl:w-14" />

  {products.map((product) => (
    <div
      key={product.id}
      data-product-slide
      className={cn(
        'flex w-[210px] shrink-0 snap-start flex-col px-0.5 py-1 md:w-[270px]',
      )}
    >
      <ProductCard
        product={product}
        variant="trending"
        imageSizes="(max-width: 768px) 210px, 270px"
      />
    </div>
  ))}

  {/* trailing spacer */}
  <div className="shrink-0 w-5 md:w-6 lg:w-10 xl:w-14" />
</div>
    </div>
  );
});

ProductCarousel.displayName = 'ProductCarousel';