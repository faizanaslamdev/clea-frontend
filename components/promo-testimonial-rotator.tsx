'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PROMO_TESTIMONIAL_ROTATE_MS,
  PROMO_TESTIMONIALS,
  type PromoTestimonial,
} from '@/lib/constants/testimonials';

const SOFT_EASE = [0.22, 1, 0.36, 1] as const;

/** Quote first, attribution just behind it -- reads as composed rather than
 *  one block swapping out. */
const LINE_STAGGER_S = 0.12;

/** Was 1.1s with a 12px blur: long enough that the middle of every swap went
 *  mushy, and the blur is the expensive half of the paint. */
const IN_DURATION_S = 0.65;
const OUT_DURATION_S = 0.45;
const BLUR_PX = 6;

const slideVariants: Variants = {
  active: {
    transition: { staggerChildren: LINE_STAGGER_S, delayChildren: 0.05 },
  },
  exit: { transition: { staggerChildren: 0.04 } },
  idle: {},
};

const lineVariants: Variants = {
  // Waiting below the fold of the card, ready to rise in. No transition:
  // slides that aren't on deck snap here instead of animating.
  idle: { opacity: 0, y: 12, filter: `blur(${BLUR_PX}px)`, transition: { duration: 0 } },
  active: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: IN_DURATION_S, ease: SOFT_EASE },
  },
  // The one just replaced keeps drifting up as it goes.
  exit: {
    opacity: 0,
    y: -8,
    filter: `blur(${BLUR_PX}px)`,
    transition: { duration: OUT_DURATION_S, ease: SOFT_EASE },
  },
};

const staticLine: Variants = {
  idle: { opacity: 0 },
  active: { opacity: 1 },
  exit: { opacity: 0 },
};

function TestimonialStars() {
  return (
    <div className="mt-3 flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="promo-panel__testimonial-star size-3.5" />
      ))}
    </div>
  );
}

function TestimonialSlide({
  testimonial,
  state,
  variants,
}: {
  testimonial: PromoTestimonial;
  state: 'active' | 'exit' | 'idle';
  variants: Variants;
}) {
  return (
    <motion.figure
      className="promo-panel__testimonial-slide"
      variants={slideVariants}
      initial={false}
      animate={state}
      aria-hidden={state !== 'active'}
      inert={state !== 'active'}
    >
      <motion.blockquote
        variants={variants}
        className="max-w-none text-sm font-light leading-relaxed text-foreground md:text-[15px] md:leading-6"
      >
        &ldquo;{testimonial.quote}&rdquo;
      </motion.blockquote>
      <motion.figcaption variants={variants}>
        <p className="mt-4 text-sm font-semibold text-foreground">
          {testimonial.author}
        </p>
        <TestimonialStars />
      </motion.figcaption>
    </motion.figure>
  );
}

export function PromoTestimonialRotator() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const count = PROMO_TESTIMONIALS.length;

  const goTo = useCallback((next: number) => {
    setActiveIndex((current) => {
      if (next === current) return current;
      setPreviousIndex(current);
      return next;
    });
  }, []);

  // Don't rotate at a wall nobody's looking at -- without this the timer runs
  // the whole time the section is off-screen, so scrolling back can drop you
  // into the middle of a quote.
  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setInView(entry.isIntersecting);
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shouldReduceMotion || count <= 1 || paused || !inView) return;

    const id = window.setInterval(() => {
      setActiveIndex((current) => {
        setPreviousIndex(current);
        return (current + 1) % count;
      });
    }, PROMO_TESTIMONIAL_ROTATE_MS);

    return () => window.clearInterval(id);
  }, [count, inView, paused, shouldReduceMotion]);

  const variants = shouldReduceMotion ? staticLine : lineVariants;

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
      {/* Every quote lives in the same grid cell, so the card is always as
          tall as the longest one. Previously the incoming quote defined the
          height and the whole scrim panel jumped ~24px on each rotation. */}
      <div className="promo-panel__testimonial-track">
        {PROMO_TESTIMONIALS.map((testimonial, index) => (
          <TestimonialSlide
            key={testimonial.author}
            testimonial={testimonial}
            variants={variants}
            state={
              index === activeIndex
                ? 'active'
                : index === previousIndex
                  ? 'exit'
                  : 'idle'
            }
          />
        ))}
      </div>

      <div className="promo-panel__testimonial-dots">
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

      <p className="sr-only">
        Anmeldelse {activeIndex + 1} av {count} av{' '}
        {PROMO_TESTIMONIALS[activeIndex].author}
      </p>
    </div>
  );
}
