'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchChatSuggestions } from '@/lib/api/chat';
import type { ShopCategory } from '@/lib/api/chat-types';
import { LANDING_SUGGESTIONS_LOCALE } from '@/lib/constants/chat';

export function useLandingSuggestions() {
  const router = useRouter();
  const [shopCategory, setShopCategory] = useState<ShopCategory>('mens');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    void fetchChatSuggestions({
      shopCategory,
      locale: LANDING_SUGGESTIONS_LOCALE,
    })
      .then((result) => {
        if (!cancelled) {
          setSuggestions(result.suggestions);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSuggestions([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shopCategory]);

  const selectSuggestion = useCallback(
    (query: string) => {
      const params = new URLSearchParams({ q: query, category: shopCategory });
      router.push(`/chat?${params.toString()}`);
    },
    [router, shopCategory],
  );

  return {
    shopCategory,
    setShopCategory,
    suggestions,
    selectSuggestion,
  };
}
