'use client';

import { useEffect, useRef, useState } from 'react';
import { SHOP_PENDING_MIN_MS } from '@/lib/shop/shop-pending';

/**
 * Shop-universal pending visual for every selection change — including warm
 * React Query cache hits.
 *
 * `transitionKey` changes whenever the shopper picks a new chip / filter /
 * audience. `dataPending` is the real fetch/navigation signal. Pending stays
 * up until both the data is ready and the minimum visible floor has elapsed,
 * so the second click on a tab still shows blur + taste pill.
 *
 * Important: when `transitionKey` changes we return `pending: true` on the
 * *same* render (not only after setState flushes). Otherwise one frame of
 * the destination product set mounts and kicks off `/_next/image` work for a
 * refinement the shopper may already have abandoned.
 */
export function useShopPendingTransition(
  transitionKey: string,
  dataPending: boolean,
): boolean {
  const [state, setState] = useState({
    key: transitionKey,
    pending: false,
    startedAt: null as number | null,
  });
  const wasDataPendingRef = useRef(dataPending);

  let effective = state;

  // Selection change during render → first paint already carries pending
  // (warm cache hits would otherwise skip the loader entirely).
  if (state.key !== transitionKey) {
    effective = {
      key: transitionKey,
      pending: true,
      startedAt: performance.now(),
    };
    setState(effective);
  } else if (dataPending && !wasDataPendingRef.current && !state.pending) {
    // Hub navigation can start without a key change (same audience).
    effective = {
      ...state,
      pending: true,
      startedAt: state.startedAt ?? performance.now(),
    };
    setState(effective);
  }
  wasDataPendingRef.current = dataPending;

  const { pending, startedAt } = effective;

  useEffect(() => {
    if (!pending) return;

    // Keep waiting while catalog/audience data is still resolving.
    if (dataPending) return;

    const started = startedAt ?? performance.now();
    const remaining = Math.max(
      0,
      SHOP_PENDING_MIN_MS - (performance.now() - started),
    );

    const timeoutId = window.setTimeout(() => {
      setState((current) =>
        current.key === transitionKey
          ? { ...current, pending: false, startedAt: null }
          : current,
      );
    }, remaining);

    return () => window.clearTimeout(timeoutId);
  }, [pending, dataPending, startedAt, transitionKey]);

  return pending;
}

/**
 * Freeze the taste-pill label for the whole pending window so the copy does
 * not flicker when readiness clears a few ms before the visual floor ends.
 */
export function useShopPendingLabel(pending: boolean, label: string): string {
  const frozenRef = useRef(label);

  if (pending && label) {
    frozenRef.current = label;
  }

  useEffect(() => {
    if (!pending) {
      frozenRef.current = label;
    }
  }, [pending, label]);

  return pending ? frozenRef.current || label : label;
}

/**
 * While pending, keep rendering the previous product set so a warm cache hit
 * does not swap the grid underneath the blur/pill on the same frame.
 */
export function useShopPendingItems<T>(pending: boolean, items: T[]): T[] {
  const frozenRef = useRef(items);

  if (!pending) {
    frozenRef.current = items;
  }

  return pending ? frozenRef.current : items;
}
