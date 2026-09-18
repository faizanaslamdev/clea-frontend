'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

import { ArrowLeft, ArrowRight } from 'lucide-react';

import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EngagementSurface } from '@/lib/api/engagement';
import {
  carouselScrollBehavior,
  getCarouselScrollStep,
} from '@/lib/ui/product-carousel-scroll';

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
  /** Accessible name for the scroll region (keyboard focus target). */
  ariaLabel?: string;
  onScrollStateChange?: (state: CarouselScrollState) => void;
  engagementSurface?: EngagementSurface;
  onProductImpression?: (productId: string) => void;
};

export const ProductCarousel = forwardRef<
  ProductCarouselHandle,
  ProductCarouselProps
>(
  (
    {
      products,
      className,
      hideControls = false,
      ariaLabel = 'Produktkarusell',
      onScrollStateChange,
      engagementSurface,
      onProductImpression,
    },
    ref,
  ) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const impressionObserverRef = useRef<IntersectionObserver | null>(null);

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollState = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      const nextLeft = scrollLeft > 4;
      const nextRight = scrollLeft + clientWidth < scrollWidth - 4;

      setCanScrollLeft(nextLeft);
      setCanScrollRight(nextRight);
      onScrollStateChange?.({
        canScrollLeft: nextLeft,
        canScrollRight: nextRight,
      });
    }, [onScrollStateChange]);

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;

      updateScrollState();

      const resizeObserver = new ResizeObserver(updateScrollState);
      resizeObserver.observe(el);

      el.addEventListener('scroll', updateScrollState, { passive: true });
      window.addEventListener('resize', updateScrollState);

      return () => {
        resizeObserver.disconnect();
        el.removeEventListener('scroll', updateScrollState);
        window.removeEventListener('resize', updateScrollState);
      };
    }, [products.length, updateScrollState]);

    useEffect(() => {
      if (!onProductImpression) {
        return;
      }

      impressionObserverRef.current?.disconnect();
      impressionObserverRef.current = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) {
              continue;
            }
            const productId = entry.target.getAttribute('data-product-id');
            if (productId) {
              onProductImpression(productId);
            }
          }
        },
        { root: scrollRef.current, threshold: 0.6 },
      );

      const observer = impressionObserverRef.current;
      const slides =
        scrollRef.current?.querySelectorAll<HTMLElement>(
          '[data-product-slide]',
        ) ?? [];

      for (const slide of slides) {
        observer.observe(slide);
      }

      return () => observer.disconnect();
    }, [products, onProductImpression]);

    const scrollByPage = useCallback((direction: 'left' | 'right') => {
      const el = scrollRef.current;
      if (!el) return;

      const distance = getCarouselScrollStep(el);
      el.scrollBy({
        left: direction === 'left' ? -distance : distance,
        behavior: carouselScrollBehavior(),
      });
    }, []);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          scrollByPage('left');
          return;
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          scrollByPage('right');
          return;
        }
        if (event.key === 'Home') {
          event.preventDefault();
          scrollRef.current?.scrollTo({
            left: 0,
            behavior: carouselScrollBehavior(),
          });
          return;
        }
        if (event.key === 'End') {
          event.preventDefault();
          const el = scrollRef.current;
          if (!el) return;
          el.scrollTo({
            left: el.scrollWidth,
            behavior: carouselScrollBehavior(),
          });
        }
      },
      [scrollByPage],
    );

    useImperativeHandle(
      ref,
      () => ({
        scrollLeft: () => scrollByPage('left'),
        scrollRight: () => scrollByPage('right'),
        canScrollLeft,
        canScrollRight,
      }),
      [scrollByPage, canScrollLeft, canScrollRight],
    );

    if (products.length === 0) {
      return (
        <p className="py-16 text-center text-muted-foreground">
          No trending products right now.
        </p>
      );
    }

    const showOverlayControls =
      !hideControls && (canScrollLeft || canScrollRight);

    return (
      <div className={cn('relative overflow-hidden', className)}>
        {showOverlayControls && (
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 hidden md:block">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Rull til venstre"
              disabled={!canScrollLeft}
              onClick={() => scrollByPage('left')}
              className={cn(
                'pointer-events-auto absolute left-6 top-1/2',
                'size-9 -translate-y-1/2 rounded-full',
                'border-border bg-card/95 backdrop-blur-sm',
                'shadow-sm transition-opacity',
                'disabled:opacity-30',
              )}
            >
              <ArrowLeft className="size-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Rull til høyre"
              disabled={!canScrollRight}
              onClick={() => scrollByPage('right')}
              className={cn(
                'pointer-events-auto absolute right-6 top-1/2',
                'size-9 -translate-y-1/2 rounded-full',
                'border-border bg-card/95 backdrop-blur-sm',
                'shadow-sm transition-opacity',
                'disabled:opacity-30',
              )}
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}

        <div
          ref={scrollRef}
          className="product-carousel__track"
          role="region"
          aria-label={ariaLabel}
          aria-roledescription="karusell"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {products.map((product) => (
            <div
              key={product.id}
              data-product-slide
              data-product-id={product.id}
              role="group"
              aria-label={product.name}
              className={cn(
                // Fixed pitch on md+, slightly viewport-relative on small
                // screens so a sliver of the next card stays visible.
                'flex w-[min(68vw,13.125rem)] shrink-0 snap-start flex-col px-0.5 py-1 sm:w-[210px] md:w-[270px]',
              )}
            >
              <ProductCard
                product={product}
                variant="trending"
                imageSizes="(max-width: 640px) 68vw, (max-width: 768px) 210px, 270px"
                engagementSurface={engagementSurface}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
);

ProductCarousel.displayName = 'ProductCarousel';
