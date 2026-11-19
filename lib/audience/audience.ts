'use client';

import { useSyncExternalStore } from 'react';
import type { ShopCategory } from '@/lib/api/chat-types';

/**
 * Who the visitor shops for, Dame or Herre, chosen once and remembered in
 * this browser until they change it (the way Zalando, ASOS and H&M remember
 * a department). The hero, the occasion covers, the colour links, the shop
 * pages and new chats all read it. Nothing until the visitor picks: a first
 * visit shows both.
 */
const STORAGE_KEY = 'clea.audience';

let current: ShopCategory | undefined;
let loaded = false;
const listeners = new Set<() => void>();

function isShopCategory(value: unknown): value is ShopCategory {
  return value === 'womens' || value === 'mens';
}

function readStored(): ShopCategory | undefined {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isShopCategory(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export function getAudience(): ShopCategory | undefined {
  if (!loaded && typeof window !== 'undefined') {
    current = readStored();
    loaded = true;
  }
  return current;
}

export function setAudience(next: ShopCategory | undefined): void {
  loaded = true;
  if (current === next) return;
  current = next;
  try {
    if (next) window.localStorage.setItem(STORAGE_KEY, next);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode: the choice lasts for this page only */
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The remembered choice; undefined on the server and before a choice. */
export function useAudience(): ShopCategory | undefined {
  return useSyncExternalStore(subscribe, getAudience, () => undefined);
}

/** True once the browser's stored value has been read (after hydration). */
export function useAudienceReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/** `gender` URL value for the shop pages, from the remembered choice. */
export function audienceGenderParam(audience: ShopCategory | undefined): 'dame' | 'herre' | undefined {
  return audience === 'mens' ? 'herre' : audience === 'womens' ? 'dame' : undefined;
}
