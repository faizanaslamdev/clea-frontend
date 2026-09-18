'use client';

import { useCallback, useEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import { prefersReducedCarouselMotion } from '@/lib/ui/product-carousel-scroll';
import {
  AUTOROLL_MIN_OVERFLOW_PX,
  AUTOROLL_RESUME_IDLE_MS,
  AUTOROLL_SPEED_PX_PER_SEC,
  advanceCarouselAutoRoll,
  measureCarouselLoopWidth,
  normalizeCarouselLoopScroll,
} from '@/lib/ui/product-carousel-autoroll';

type UseCarouselAutoRollArgs = {
  enabled: boolean;
  trackRef: RefObject<HTMLDivElement | null>;
  rootRef: RefObject<HTMLDivElement | null>;
  /** Re-measure when the product list length changes. */
  itemCount: number;
};

/**
 * Continuous rAF ticker for ProductCarousel. Mutates scrollLeft only —
 * no per-frame React state.
 */
export function useCarouselAutoRoll({
  enabled,
  trackRef,
  rootRef,
  itemCount,
}: UseCarouselAutoRollArgs): {
  pauseForInteraction: () => void;
  scheduleResume: () => void;
  isProgrammaticScrollRef: MutableRefObject<boolean>;
} {
    const loopWidthRef = useRef(0);
  const pausedRef = useRef(false);
  const hoverPausedRef = useRef(false);
  // Start true; IntersectionObserver corrects once the first callback lands.
  // Avoids a stuck-paused ticker when the section is already on-screen.
  const visibleRef = useRef(true);
  const reducedMotionRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current != null) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const setAutorollingClass = useCallback(
    (active: boolean) => {
      const track = trackRef.current;
      if (!track) return;
      track.classList.toggle('product-carousel__track--autorolling', active);
    },
    [trackRef],
  );

  const pauseForInteraction = useCallback(() => {
    pausedRef.current = true;
    clearResumeTimer();
    setAutorollingClass(false);
  }, [clearResumeTimer, setAutorollingClass]);

  const scheduleResume = useCallback(() => {
    if (hoverPausedRef.current) {
      return;
    }
    clearResumeTimer();
    resumeTimerRef.current = setTimeout(() => {
      resumeTimerRef.current = null;
      if (hoverPausedRef.current || reducedMotionRef.current) {
        return;
      }
      const track = trackRef.current;
      if (track && loopWidthRef.current > 0) {
        isProgrammaticScrollRef.current = true;
        normalizeCarouselLoopScroll(track, loopWidthRef.current);
        isProgrammaticScrollRef.current = false;
      }
      pausedRef.current = false;
      setAutorollingClass(true);
    }, AUTOROLL_RESUME_IDLE_MS);
  }, [clearResumeTimer, setAutorollingClass, trackRef]);

  const remeasure = useCallback(() => {
    const track = trackRef.current;
    if (!track) {
      loopWidthRef.current = 0;
      return;
    }
    loopWidthRef.current = measureCarouselLoopWidth(track);
  }, [trackRef]);

  useEffect(() => {
    if (!enabled) {
      setAutorollingClass(false);
      return;
    }

    const track = trackRef.current;
    const root = rootRef.current;
    if (!track || !root) return;

    reducedMotionRef.current = prefersReducedCarouselMotion();
    remeasure();

    const canRoll = () =>
      !reducedMotionRef.current &&
      visibleRef.current &&
      !pausedRef.current &&
      !hoverPausedRef.current &&
      loopWidthRef.current > AUTOROLL_MIN_OVERFLOW_PX &&
      track.scrollWidth > track.clientWidth + AUTOROLL_MIN_OVERFLOW_PX;

    if (!reducedMotionRef.current) {
      setAutorollingClass(true);
    }

    let lastTs = performance.now();
    let carryPx = 0;
    let frameCount = 0;

    const tick = (now: number) => {
      const dt = Math.min(48, Math.max(0, now - lastTs));
      lastTs = now;
      frameCount += 1;

      // Periodic remeasure + viewport visibility (IO is unreliable with
      // transformed Reveal ancestors / programmatic scroll).
      if (frameCount === 1 || frameCount % 15 === 0) {
        remeasure();
        syncViewportVisibility();
      }

      if (canRoll()) {
        carryPx += (AUTOROLL_SPEED_PX_PER_SEC * dt) / 1000;
        if (carryPx >= 1) {
          const step = Math.floor(carryPx);
          carryPx -= step;
          isProgrammaticScrollRef.current = true;
          advanceCarouselAutoRoll(track, loopWidthRef.current, step);
          isProgrammaticScrollRef.current = false;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => {
      reducedMotionRef.current = motionQuery.matches;
      if (motionQuery.matches) {
        pauseForInteraction();
        setAutorollingClass(false);
      } else if (!hoverPausedRef.current) {
        scheduleResume();
      }
    };
    motionQuery.addEventListener('change', onMotionChange);

    const onVisibility = () => {
      visibleRef.current = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', onVisibility);

    const syncViewportVisibility = () => {
      if (document.visibilityState !== 'visible') {
        visibleRef.current = false;
        return;
      }
      const rootRect = root.getBoundingClientRect();
      visibleRef.current =
        rootRect.bottom > 40 && rootRect.top < window.innerHeight - 40;
    };
    syncViewportVisibility();

    const onEnter = () => {
      hoverPausedRef.current = true;
      pauseForInteraction();
    };
    const onLeave = () => {
      hoverPausedRef.current = false;
      scheduleResume();
    };

    const onFocusIn = () => {
      pauseForInteraction();
    };
    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget;
      if (next instanceof Node && root.contains(next)) {
        return;
      }
      scheduleResume();
    };

    const onPointerDown = () => {
      pauseForInteraction();
    };
    const onPointerUp = () => {
      scheduleResume();
    };

    const onScroll = () => {
      // Ignore ticker-driven scroll events (and brief settle after scrollTo).
      if (isProgrammaticScrollRef.current) return;
      if (track.classList.contains('product-carousel__track--autorolling')) {
        return;
      }
      pauseForInteraction();
      scheduleResume();
    };

    const onResize = () => {
      remeasure();
    };

    root.addEventListener('mouseenter', onEnter);
    root.addEventListener('mouseleave', onLeave);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    track.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(track);

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      clearResumeTimer();
      setAutorollingClass(false);
      motionQuery.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', onVisibility);
      resizeObserver.disconnect();
      root.removeEventListener('mouseenter', onEnter);
      root.removeEventListener('mouseleave', onLeave);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
      track.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [
    enabled,
    itemCount,
    trackRef,
    rootRef,
    remeasure,
    pauseForInteraction,
    scheduleResume,
    clearResumeTimer,
    setAutorollingClass,
  ]);

  return {
    pauseForInteraction,
    scheduleResume,
    isProgrammaticScrollRef,
  };
}
