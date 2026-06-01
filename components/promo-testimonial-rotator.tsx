'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Star } from 'lucide-react';
import {
  PROMO_TESTIMONIAL_ROTATE_MS,
  PROMO_TESTIMONIALS,
  type PromoTestimonial,
} from '@/lib/constants/testimonials';

const SOFT_EASE = [0.22, 1, 0.36, 1] as const;

const testimonialMotion = {
  initial: {
    opacity: 0,
    y: 18,
    filter: 'blur(12px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: 'blur(12px)',
  },
};

function TestimonialStars() {
  return (
    <div className="mt-3 flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="size-3.5 fill-muted-foreground text-muted-foreground"
        />
      ))}
    </div>
  );
}

function TestimonialContent({ testimonial }: { testimonial: PromoTestimonial }) {
  return (
    <>
      <blockquote className="max-w-none text-sm font-light leading-relaxed text-foreground md:text-[15px] md:leading-6">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <figcaption>
        <p className="mt-4 text-sm font-semibold text-foreground">
          {testimonial.author}
        </p>
        <TestimonialStars />
      </figcaption>
    </>
  );
}

export function PromoTestimonialRotator() {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const count = PROMO_TESTIMONIALS.length;
  const active = PROMO_TESTIMONIALS[activeIndex];

  useEffect(() => {
    if (shouldReduceMotion || count <= 1) return;

    const id = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % count);
    }, PROMO_TESTIMONIAL_ROTATE_MS);

    return () => window.clearInterval(id);
  }, [count, shouldReduceMotion]);

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 1.1, ease: SOFT_EASE };

  return (
    <div
      className="promo-panel__testimonial-card"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Customer reviews"
    >
      <div className="promo-panel__testimonial-track">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.figure
            key={active.author}
            className="promo-panel__testimonial-slide"
            initial={testimonialMotion.initial}
            animate={testimonialMotion.animate}
            exit={testimonialMotion.exit}
            transition={transition}
          >
            <TestimonialContent testimonial={active} />
          </motion.figure>
        </AnimatePresence>
      </div>

      <p className="sr-only">
        Anmeldelse {activeIndex + 1} av {count} av {active.author}
      </p>
    </div>
  );
}
