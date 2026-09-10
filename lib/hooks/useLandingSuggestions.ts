'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchChatSuggestions } from '@/lib/api/chat';
import type { ShopCategory } from '@/lib/api/chat-types';
import { navigateToChatEntry } from '@/lib/chat/chat-entry';
import { LANDING_SUGGESTIONS_LOCALE } from '@/lib/constants/chat';
import { SEARCH_PLACEHOLDER_EXAMPLES } from '@/lib/constants/search-prompts';

const SHOP_CATEGORIES = ['womens', 'mens'] as const satisfies readonly ShopCategory[];

function fallbackSuggestions(category: ShopCategory): string[] {
  return [...SEARCH_PLACEHOLDER_EXAMPLES[category]];
}

async function loadSuggestions(shopCategory: ShopCategory): Promise<string[]> {
  const result = await fetchChatSuggestions({
    shopCategory,
    locale: LANDING_SUGGESTIONS_LOCALE,
  });
  return result.suggestions.length > 0
    ? result.suggestions
    : fallbackSuggestions(shopCategory);
}

/**
 * Landing Dame/Herre suggestions — seeded with curated fallbacks so chips
 * paint with the hero (no skeleton height jump on reload), then swapped for
 * live AI lists. Both audiences are cached so toggle swaps stay instant.
 */
export function useLandingSuggestions() {
  const router = useRouter();
  const [shopCategory, setShopCategory] = useState<ShopCategory>('mens');
  const shopCategoryRef = useRef(shopCategory);
  shopCategoryRef.current = shopCategory;

  const [suggestions, setSuggestions] = useState<string[]>(() =>
    fallbackSuggestions('mens'),
  );
  const cacheRef = useRef<Partial<Record<ShopCategory, string[]>>>({
    mens: fallbackSuggestions('mens'),
    womens: fallbackSuggestions('womens'),
  });
  const liveFetchedRef = useRef<Partial<Record<ShopCategory, boolean>>>({});
  const inflightRef = useRef<Partial<Record<ShopCategory, Promise<string[]>>>>({});

  const ensureSuggestions = useCallback(async (category: ShopCategory) => {
    if (liveFetchedRef.current[category] && cacheRef.current[category]?.length) {
      return cacheRef.current[category]!;
    }

    const inflight = inflightRef.current[category];
    if (inflight) return inflight;

    const request = loadSuggestions(category)
      .then((next) => {
        cacheRef.current[category] = next;
        liveFetchedRef.current[category] = true;
        return next;
      })
      .finally(() => {
        delete inflightRef.current[category];
      });

    inflightRef.current[category] = request;
    return request;
  }, []);

  useEffect(() => {
    for (const category of SHOP_CATEGORIES) {
      void ensureSuggestions(category)
        .then((next) => {
          if (shopCategoryRef.current === category) {
            setSuggestions(next);
          }
        })
        .catch(() => {
          /* fallbacks already on screen */
        });
    }
  }, [ensureSuggestions]);

  useEffect(() => {
    const cached = cacheRef.current[shopCategory];
    if (cached && cached.length > 0) {
      setSuggestions(cached);
    }

    let cancelled = false;
    void ensureSuggestions(shopCategory)
      .then((next) => {
        if (!cancelled) setSuggestions(next);
      })
      .catch(() => {
        if (!cancelled) setSuggestions(fallbackSuggestions(shopCategory));
      });

    return () => {
      cancelled = true;
    };
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
    isLoadingSuggestions: false,
    selectSuggestion,
  };
}
