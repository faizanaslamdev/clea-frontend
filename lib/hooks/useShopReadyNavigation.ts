'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { productKeys } from '@/lib/query/keys';
import {
  catalogFiltersForShopHref,
  prefetchShopBrowseCatalog,
} from '@/lib/shop/prefetch-shop-browse';

export type ShopReadyNavigationResult =
  | { status: 'navigated' }
  | { status: 'cancelled' }
  | { status: 'error'; error: unknown };

/**
 * Prefetch-then-navigate for Shop browse destinations.
 *
 * Keeps the current hub frame mounted under soft blur until the destination's
 * first catalog page is in React Query, then swaps. A generation token drops
 * stale completions when the shopper clicks a different destination.
 */
export function useShopReadyNavigation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const generationRef = useRef(0);
  const lastHrefRef = useRef<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    return () => {
      generationRef.current += 1;
    };
  }, []);

  const reset = useCallback(() => {
    generationRef.current += 1;
    setIsNavigating(false);
    setError(null);
  }, []);

  const navigateToShopHref = useCallback(
    async (href: string): Promise<ShopReadyNavigationResult> => {
      const generation = ++generationRef.current;
      lastHrefRef.current = href;
      setError(null);

      const filters = catalogFiltersForShopHref(href);
      const catalogReady = Boolean(
        filters && queryClient.getQueryData(productKeys.catalog(filters)),
      );

      // Cache hit: swap immediately — no blur flash just to show loading.
      if (catalogReady) {
        void Promise.resolve(router.prefetch(href)).catch(() => undefined);
        if (generation !== generationRef.current) {
          return { status: 'cancelled' };
        }
        router.push(href);
        return { status: 'navigated' };
      }

      setIsNavigating(true);

      try {
        const routePrefetch = Promise.resolve(router.prefetch(href)).catch(
          () => undefined,
        );
        await Promise.all([
          prefetchShopBrowseCatalog(queryClient, href),
          routePrefetch,
        ]);

        if (generation !== generationRef.current) {
          return { status: 'cancelled' };
        }

        if (filters && !queryClient.getQueryData(productKeys.catalog(filters))) {
          throw new Error('Shop browse catalog prefetch returned no data');
        }

        router.push(href);
        return { status: 'navigated' };
      } catch (err) {
        if (generation !== generationRef.current) {
          return { status: 'cancelled' };
        }
        setIsNavigating(false);
        setError(err);
        return { status: 'error', error: err };
      }
    },
    [queryClient, router],
  );

  const retry = useCallback(() => {
    const href = lastHrefRef.current;
    if (!href) {
      reset();
      return;
    }
    void navigateToShopHref(href);
  }, [navigateToShopHref, reset]);

  return {
    isNavigating,
    error,
    navigateToShopHref,
    reset,
    retry,
  };
}
