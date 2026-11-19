'use client';

import { useSyncExternalStore } from 'react';
import type { ShopCategory } from '@/lib/api/chat-types';

/**
 * The homepage's Dame/Herre choice, shared between the hero (where it is
 * picked) and the sections below it, so the occasion covers and the colour
 * links follow the same audience. Page-local: nothing is stored.
 */
let audience: ShopCategory | undefined;
const listeners = new Set<() => void>();

export function setHomeAudience(next: ShopCategory | undefined): void {
  if (audience === next) return;
  audience = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useHomeAudience(): ShopCategory | undefined {
  return useSyncExternalStore(
    subscribe,
    () => audience,
    () => undefined,
  );
}
