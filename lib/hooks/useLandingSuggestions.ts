'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchChatSuggestions } from '@/lib/api/chat';
import type { ShopCategory } from '@/lib/api/chat-types';
import { navigateToChatEntry } from '@/lib/chat/chat-entry';
import { LANDING_SUGGESTIONS_LOCALE } from '@/lib/constants/chat';

const SHOP_CATEGORIES = ['womens', 'mens'] as const satisfies readonly ShopCategory[];

async function loadSuggestions(shopCategory: ShopCategory): Promise<string[]> {
  const result = await fetchChatSuggestions({
    shopCategory,
    locale: LANDING_SUGGESTIONS_LOCALE,
  });
  return result.suggestions;
}

/**
 * Landing Dame/Herre suggestions — cached per category and prefetched for
 * both so toggle swaps are instant (no skeleton flash / layout jump).
 */
export function useLandingSuggestions() {
  const router = useRouter();
  const [shopCategory, setShopCategory] = useState<ShopCategory>('mens');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const cacheRef = useRef<Partial<Record<ShopCategory, string[]>>>({});
  const inflightRef = useRef<Partial<Record<ShopCategory, Promise<string[]>>>>({});

  const ensureSuggestions = useCallback(async (category: ShopCategory) => {
    const cached = cacheRef.current[category];
    if (cached && cached.length > 0) return cached;

    const inflight = inflightRef.current[category];
    if (inflight) return inflight;

    const request = loadSuggestions(category)
      .then((next) => {
        cacheRef.current[category] = next;
        return next;
      })
      .finally(() => {
        delete inflightRef.current[category];
      });

    inflightRef.current[category] = request;
    return request;
  }, []);

  // Prefetch both audiences once so the first Dame↔Herre click is a cache hit.
  useEffect(() => {
    for (const category of SHOP_CATEGORIES) {
      void ensureSuggestions(category).catch(() => {
        /* first paint still handled by the active-category effect below */
      });
    }
  }, [ensureSuggestions]);

  useEffect(() => {
    let cancelled = false;
    const cached = cacheRef.current[shopCategory];

    if (cached && cached.length > 0) {
      setSuggestions(cached);
      setIsLoadingSuggestions(false);
      return;
    }

    // Keep the previous audience's chips on screen (reserved height stays
    // filled) until the new list arrives — never collapse to empty/skeleton
    // mid-toggle. Skeleton only on the very first visit with no cache yet.
    setIsLoadingSuggestions((prev) => (suggestions.length === 0 ? true : prev));

    void ensureSuggestions(shopCategory)
      .then((next) => {
        if (!cancelled) {
          setSuggestions(next);
          setIsLoadingSuggestions(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSuggestions([]);
          setIsLoadingSuggestions(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // suggestions.length intentionally omitted — only re-run on category change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopCategory, ensureSuggestions]);

  const selectSuggestion = useCallback(
    (query: string) => {
      navigateToChatEntry(router, { query, shopCategory });
    },
    [router, shopCategory],
  );

  return {
    shopCategory,
    setShopCategory,
    suggestions,
    isLoadingSuggestions,
    selectSuggestion,
  };
}
