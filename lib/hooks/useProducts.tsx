import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  fetchCategoryPreviews,
  fetchFeaturedProducts,
  fetchProductById,
  fetchProductOffers,
  fetchSimilarProducts,
  fetchTrendingLooks,
} from '@/lib/api/products';
import { CATEGORY_GRID_ENTRIES } from '@/lib/constants/category-grid';
import { POPULAR_PRODUCTS_LIMIT } from '@/lib/constants/popular-brands';
import { STALE_TIME_STATIC_MS } from '@/lib/query/client';
import { productKeys } from '@/lib/query/keys';
import type { SuitableFor } from '@/lib/api/chat-types';

export function useFeaturedProducts(limit = POPULAR_PRODUCTS_LIMIT) {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => fetchFeaturedProducts(limit),
    staleTime: STALE_TIME_STATIC_MS,
  });
}

export function useCategoryPreviews(suitableFor?: SuitableFor) {
  return useQuery({
    queryKey: productKeys.categoryGrid(suitableFor),
    queryFn: () => fetchCategoryPreviews(CATEGORY_GRID_ENTRIES, suitableFor),
    staleTime: STALE_TIME_STATIC_MS,
    // Flipping Dame/Herre keeps the cards that are already on screen until
    // the new audience's photos land, so the row swaps its contents in
    // place instead of collapsing to skeletons and back.
    placeholderData: keepPreviousData,
  });
}

export function useTrendingLooks(suitableFor?: SuitableFor, count = 3) {
  return useQuery({
    queryKey: productKeys.trending(suitableFor),
    queryFn: () => fetchTrendingLooks(suitableFor, count),
    staleTime: STALE_TIME_STATIC_MS,
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProductById(id),
    staleTime: STALE_TIME_STATIC_MS,
    enabled: !!id,
  });
}

export function useSimilarProducts(id: string, limit = 4) {
  return useQuery({
    queryKey: productKeys.similar(id),
    queryFn: () => fetchSimilarProducts(id, limit),
    staleTime: STALE_TIME_STATIC_MS,
    enabled: !!id,
  });
}

export function useProductOffers(id: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.offers(id),
    queryFn: () => fetchProductOffers(id),
    staleTime: STALE_TIME_STATIC_MS,
    enabled: !!id && enabled,
  });
}
