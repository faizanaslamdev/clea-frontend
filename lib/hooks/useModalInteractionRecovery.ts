'use client';

import { useEffect, useRef, useState } from 'react';

function isCoarsePointerDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(pointer: coarse)').matches ||
    navigator.maxTouchPoints > 0
  );
}

function isEditableFocused(): boolean {
  const active = document.activeElement;
  if (!active) {
    return false;
  }

  if (
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement ||
    active instanceof HTMLSelectElement
  ) {
    return true;
  }

  return active instanceof HTMLElement && active.isContentEditable;
}

/**
 * Screenshot preview and similar iOS system strips shrink visualViewport slightly.
 * Keyboard overlays are larger and already skipped when an editable field is focused.
 */
function isLikelySystemOverlayViewportChange(): boolean {
  const viewport = window.visualViewport;
  if (!viewport) {
    return false;
  }

  const overlayChrome =
    window.innerHeight - viewport.height - viewport.offsetTop;

  return overlayChrome > 0 && overlayChrome < 180;
}

/**
 * iOS Safari can leave Radix/react-remove-scroll in a broken state after system
 * overlays (screenshot preview, app switcher). Remounting the dialog portal
 * restores touch scrolling and interaction inside the modal.
 *
 * Screenshot capture often keeps `document.visibilityState === 'visible'`, so
 * recovery must also listen for focus/viewport signals that fire while the page
 * stays visible.
 */
export function useModalInteractionRecovery(enabled: boolean): number {
  const [epoch, setEpoch] = useState(0);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    if (!enabled || !isCoarsePointerDevice()) {
      return;
    }

    let hiddenAt: number | null = null;
    let blurredWhileVisible = false;
    let recoveryFrame: number | null = null;

    const bumpEpoch = () => {
      setEpoch((value) => value + 1);
    };

    const scheduleRecovery = () => {
      if (recoveryFrame != null) {
        return;
      }

      recoveryFrame = window.requestAnimationFrame(() => {
        recoveryFrame = null;
        if (!enabledRef.current) {
          return;
        }
        bumpEpoch();
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
        return;
      }

      if (document.visibilityState === 'visible' && hiddenAt != null) {
        scheduleRecovery();
        hiddenAt = null;
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        scheduleRecovery();
      }
    };

    const handleWindowBlur = () => {
      if (document.visibilityState === 'visible') {
        blurredWhileVisible = true;
      }
    };

    const handleWindowFocus = () => {
      if (!blurredWhileVisible || document.visibilityState !== 'visible') {
        blurredWhileVisible = false;
        return;
      }

      blurredWhileVisible = false;
      scheduleRecovery();
    };

    const handleVisualViewportChange = () => {
      if (shouldSkipViewportRecovery()) {
        return;
      }

      if (isLikelySystemOverlayViewportChange()) {
        scheduleRecovery();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.visualViewport?.addEventListener('resize', handleVisualViewportChange);
    window.visualViewport?.addEventListener(
      'scroll',
      handleVisualViewportChange,
    );

    return () => {
      if (recoveryFrame != null) {
        window.cancelAnimationFrame(recoveryFrame);
      }

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.visualViewport?.removeEventListener(
        'resize',
        handleVisualViewportChange,
      );
      window.visualViewport?.removeEventListener(
        'scroll',
        handleVisualViewportChange,
      );
    };
  }, [enabled]);

  return epoch;
}

function shouldSkipViewportRecovery(): boolean {
  return (
    document.visibilityState !== 'visible' ||
    isEditableFocused()
  );
}

export {
  isCoarsePointerDevice,
  isEditableFocused,
  isLikelySystemOverlayViewportChange,
};
