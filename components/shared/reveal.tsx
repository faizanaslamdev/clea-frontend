'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Extra transition-delay in ms — use to stagger adjacent sections slightly. */
  delayMs?: number;
}

/**
 * Fades + rises a section in the first time it scrolls into view.
 * Mirrors the scroll-entrance pattern seen across editorial fashion sites
 * (Daydream included) — a single opacity/translateY pass per section, not
 * per-card, kept subtle and respecting prefers-reduced-motion.
 */
export function Reveal({ children, className, delayMs }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn('reveal-on-scroll', visible && 'reveal-on-scroll--visible', className)}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
