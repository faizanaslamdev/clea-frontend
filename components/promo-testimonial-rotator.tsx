'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PROMO_TESTIMONIAL_ROTATE_MS,
  PROMO_TESTIMONIALS,
} from '@/lib/constants/testimonials';

const SOFT_EASE = [0.22, 1, 0.36, 1] as const;

function TestimonialStars() {
  return (
    <div className="mt-0.5 flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="promo-panel__testimonial-star size-3.5" />
      ))}
    </div>
  );
}

/**
 * Single-slide rotator. Quote animates; author + dots share one footer row
 * (name left, slider right) to keep the fade band compact.
 */
export function PromoTestimonialRotator() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackMinHeight, setTrackMinHeight] = useState<number>();
  const measureRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const count = PROMO_TESTIMONIALS.length;

  const activeIndexRef = useRef(0);
  const pausedRef = useRef(false);
  const inViewRef = useRef(false);

  const goTo = useCallback((next: number) => {
    if (next === activeIndexRef.current) return;
    activeIndexRef.current = next;
    setActiveIndex(next);
  }, []);

  const setPaused = useCallback((value: boolean) => {
    pausedRef.current = value;
  }, []);

  useLayoutEffect(() => {
    const node = measureRef.current;
    if (!node) return;

    const measure = () => {
      const items = node.querySelectorAll<HTMLElement>(
        '.promo-panel__testimonial-measure-item',
      );
      let max = 0;
      items.forEach((item) => {
        max = Math.max(max, item.offsetHeight);
      });
      if (max > 0) setTrackMinHeight(max);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      inViewRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shouldReduceMotion || count <= 1) return;

    const id = window.setInterval(() => {
      if (pausedRef.current || !inViewRef.current) return;
      goTo((activeIndexRef.current + 1) % count);
    }, PROMO_TESTIMONIAL_ROTATE_MS);

    return () => window.clearInterval(id);
  }, [count, goTo, shouldReduceMotion]);

  const active = PROMO_TESTIMONIALS[activeIndex];

  return (
    <div
      ref={cardRef}
      className="promo-panel__testimonial-card"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Kundeanmeldelser"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Invisible sizer: longest quote wins, keeps the fade band stable. */}
      <div
        ref={measureRef}
        className="promo-panel__testimonial-measure"
        aria-hidden
      >
        {PROMO_TESTIMONIALS.map((testimonial) => (
          <div key={testimonial.author} className="promo-panel__testimonial-measure-item">
            <p className="promo-panel__testimonial-quote">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
          </div>
        ))}
      </div>

      <div
        className="promo-panel__testimonial-track"
        style={trackMinHeight ? { minHeight: trackMinHeight } : undefined}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.blockquote
            key={active.author}
            className="promo-panel__testimonial-quote"
            initial={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: shouldReduceMotion ? 0.15 : 0.35, ease: SOFT_EASE }}
          >
            &ldquo;{active.quote}&rdquo;
          </motion.blockquote>
        </AnimatePresence>
      </div>

      <div className="promo-panel__testimonial-footer">
        <div className="promo-panel__testimonial-byline min-w-0">
          <p className="promo-panel__testimonial-author">{active.author}</p>
          <TestimonialStars />
        </div>

        <div className="promo-panel__testimonial-dots" role="group" aria-label="Anmeldelser">
          {PROMO_TESTIMONIALS.map((testimonial, index) => (
            <button
              key={testimonial.author}
              type="button"
              className={cn(
                'promo-panel__testimonial-dot',
                index === activeIndex && 'promo-panel__testimonial-dot--active',
              )}
              aria-label={`Vis anmeldelse ${index + 1} av ${count}`}
              aria-current={index === activeIndex}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      </div>

      <p className="sr-only">
        Anmeldelse {activeIndex + 1} av {count} av {active.author}
      </p>
    </div>
  );
}
