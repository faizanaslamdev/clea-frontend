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
import { useCarouselAutoRoll } from '@/lib/hooks/use-carousel-autoroll';
import { normalizeCarouselLoopScroll } from '@/lib/ui/product-carousel-autoroll';

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
  /**
   * Opt-in continuous slow horizontal ticker. Only enable for surfaces that
   * explicitly want auto-roll (e.g. home Populært nå).
   */
  autoRoll?: boolean;
  onScrollStateChange?: (state: CarouselScrollState) => void;
  engagementSurface?: EngagementSurface;
  onProductImpression?: (productId: string) => void;
};

const SLIDE_CLASS =
  'flex w-[min(68vw,13.125rem)] shrink-0 snap-start flex-col px-0.5 py-1 sm:w-[210px] md:w-[270px]';

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
      autoRoll = false,
      onScrollStateChange,
      engagementSurface,
      onProductImpression,
    },
    ref,
  ) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const impressionObserverRef = useRef<IntersectionObserver | null>(null);
    const loopWidthCacheRef = useRef(0);

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const { pauseForInteraction, scheduleResume, isProgrammaticScrollRef } =
      useCarouselAutoRoll({
        enabled: autoRoll && products.length > 1,
        trackRef: scrollRef,
        rootRef,
        itemCount: products.length,
      });

    const updateScrollState = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      if (autoRoll) {
        // Infinite loop — both directions remain available while content overflows.
        const overflows = el.scrollWidth > el.clientWidth + 4;
        setCanScrollLeft(overflows);
        setCanScrollRight(overflows);
        onScrollStateChange?.({
          canScrollLeft: overflows,
          canScrollRight: overflows,
        });
        return;
      }

      const { scrollLeft, scrollWidth, clientWidth } = el;
      const nextLeft = scrollLeft > 4;
      const nextRight = scrollLeft + clientWidth < scrollWidth - 4;

      setCanScrollLeft(nextLeft);
      setCanScrollRight(nextRight);
      onScrollStateChange?.({
        canScrollLeft: nextLeft,
        canScrollRight: nextRight,
      });
    }, [autoRoll, onScrollStateChange]);

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;

      updateScrollState();

      const resizeObserver = new ResizeObserver(updateScrollState);
      resizeObserver.observe(el);

      const onScroll = () => {
        if (isProgrammaticScrollRef.current) return;
        updateScrollState();
      };

      el.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', updateScrollState);

      return () => {
        resizeObserver.disconnect();
        el.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', updateScrollState);
      };
    }, [products.length, updateScrollState, isProgrammaticScrollRef]);

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
      // Primary set only — clones are aria-hidden and must not double-fire.
      const slides =
        scrollRef.current?.querySelectorAll<HTMLElement>(
          '[data-product-slide][data-loop-set="0"]',
        ) ??
        scrollRef.current?.querySelectorAll<HTMLElement>(
          '[data-product-slide]',
        ) ??
        [];

      for (const slide of slides) {
        observer.observe(slide);
      }

      return () => observer.disconnect();
    }, [products, onProductImpression, autoRoll]);

    const refreshLoopWidth = useCallback(() => {
      const el = scrollRef.current;
      if (!el || !autoRoll) {
        loopWidthCacheRef.current = 0;
        return 0;
      }
      const firstClone = el.querySelector<HTMLElement>(
        '[data-product-slide][data-loop-set="1"]',
      );
      const firstPrimary = el.querySelector<HTMLElement>(
        '[data-product-slide][data-loop-set="0"]',
      );
      if (!firstClone || !firstPrimary) {
        loopWidthCacheRef.current = 0;
        return 0;
      }
      loopWidthCacheRef.current = firstClone.offsetLeft - firstPrimary.offsetLeft;
      return loopWidthCacheRef.current;
    }, [autoRoll]);

    const scrollByPage = useCallback(
      (direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;

        pauseForInteraction();
        const distance = getCarouselScrollStep(el);
        const loopWidth = refreshLoopWidth();

        let settled = false;
        const settle = () => {
          if (settled) return;
          settled = true;
          if (autoRoll && loopWidth > 0) {
            isProgrammaticScrollRef.current = true;
            normalizeCarouselLoopScroll(el, loopWidth);
            isProgrammaticScrollRef.current = false;
          }
          updateScrollState();
          scheduleResume();
        };

        isProgrammaticScrollRef.current = true;
        el.scrollBy({
          left: direction === 'left' ? -distance : distance,
          behavior: carouselScrollBehavior(),
        });

        const onScrollEnd = () => {
          el.removeEventListener('scrollend', onScrollEnd);
          isProgrammaticScrollRef.current = false;
          settle();
        };
        el.addEventListener('scrollend', onScrollEnd, { once: true });
        window.setTimeout(() => {
          el.removeEventListener('scrollend', onScrollEnd);
          isProgrammaticScrollRef.current = false;
          settle();
        }, 480);
      },
      [
        autoRoll,
        pauseForInteraction,
        scheduleResume,
        refreshLoopWidth,
        updateScrollState,
        isProgrammaticScrollRef,
      ],
    );

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
          pauseForInteraction();
          scrollRef.current?.scrollTo({
            left: 0,
            behavior: carouselScrollBehavior(),
          });
          scheduleResume();
          return;
        }
        if (event.key === 'End') {
          event.preventDefault();
          pauseForInteraction();
          const el = scrollRef.current;
          if (!el) return;
          const loopWidth = refreshLoopWidth();
          const target =
            autoRoll && loopWidth > 0
              ? Math.max(0, loopWidth - el.clientWidth)
              : el.scrollWidth;
          el.scrollTo({
            left: target,
            behavior: carouselScrollBehavior(),
          });
          scheduleResume();
        }
      },
      [
        scrollByPage,
        pauseForInteraction,
        scheduleResume,
        autoRoll,
        refreshLoopWidth,
      ],
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

    const renderSlide = (product: Product, loopSet: 0 | 1) => {
      const isClone = loopSet === 1;
      return (
        <div
          key={`${product.id}__loop${loopSet}`}
          data-product-slide
          data-product-id={product.id}
          data-loop-set={loopSet}
          data-carousel-clone={isClone ? 'true' : undefined}
          role="group"
          aria-label={product.name}
          aria-hidden={isClone ? true : undefined}
          className={SLIDE_CLASS}
        >
          <ProductCard
            product={product}
            variant="trending"
            imageSizes="(max-width: 640px) 68vw, (max-width: 768px) 210px, 270px"
            engagementSurface={engagementSurface}
          />
        </div>
      );
    };

    return (
      <div ref={rootRef} className={cn('relative overflow-hidden', className)}>
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
                'pointer-events-auto absolute left-auto right-6 top-1/2',
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
          {products.map((product) => renderSlide(product, 0))}
          {autoRoll
            ? products.map((product) => renderSlide(product, 1))
            : null}
        </div>
      </div>
    );
  },
);

ProductCarousel.displayName = 'ProductCarousel';
