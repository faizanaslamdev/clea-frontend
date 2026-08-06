'use client';

import { useEffect, useState } from 'react';

function isCoarsePointerDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(pointer: coarse)').matches ||
    navigator.maxTouchPoints > 0
  );
}

/**
 * iOS Safari can leave Radix/react-remove-scroll in a broken state after system
 * overlays (screenshot preview, app switcher). Remounting the dialog portal
 * restores touch scrolling and interaction inside the modal.
 */
export function useModalInteractionRecovery(enabled: boolean): number {
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    if (!enabled || !isCoarsePointerDevice()) {
      return;
    }

    let hiddenAt: number | null = null;

    const bumpEpoch = () => {
      setEpoch((value) => value + 1);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
        return;
      }

      if (document.visibilityState === 'visible' && hiddenAt != null) {
        bumpEpoch();
        hiddenAt = null;
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        bumpEpoch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [enabled]);

  return epoch;
}

export { isCoarsePointerDevice };
