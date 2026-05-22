'use client';

import { useEffect, useRef, useState } from 'react';

type Options = {
  end: number;
  duration?: number;
  suffix?: string;
  start?: number;
};

export function useCountUp({
  end,
  duration = 1400,
  suffix = '',
  start = 0,
}: Options) {
  const [display, setDisplay] = useState(start);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReduced) {
      setDisplay(end);
      hasAnimated.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;

        const startTime = performance.now();

        const tick = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(start + (end - start) * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, start]);

  return { ref, display: `${display}${suffix}` };
}