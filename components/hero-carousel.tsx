'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type HeroSlide = {
  src: string;
  alt: string;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
  intervalMs?: number;
  className?: string;
};

export function HeroCarousel({
  slides,
  intervalMs = 5000,
  className,
}: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (i: number) => {
      if (slides.length === 0) return;
      setIndex(((i % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (slides.length <= 1 || paused) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);

    return () => clearInterval(id);
  }, [slides.length, intervalMs, paused]);

  if (slides.length === 0) {
    return (
      <div
        className={cn(
          'min-h-[320px] rounded-lg border border-border bg-muted lg:min-h-[480px]',
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn('group relative min-h-[320px] lg:min-h-[480px]', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-full min-h-[inherit] overflow-hidden rounded-lg border border-border bg-muted">
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000 ease-in-out',
              i === index ? 'opacity-100' : 'opacity-0'
            )}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        ))}

        <div
          className="pointer-events-none absolute inset-0 bg-foreground/10 transition-colors duration-500 group-hover:bg-foreground/20"
          aria-hidden
        />
      </div>

      {slides.length > 1 && (
        <>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === index
                    ? 'w-8 bg-primary'
                    : 'w-1.5 bg-foreground/30 hover:bg-foreground/50'
                )}
              />
            ))}
          </div>

       
        </>
      )}
    </div>
  );
}