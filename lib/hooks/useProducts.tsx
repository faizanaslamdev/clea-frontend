import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  fetchCategoryPreviews,
  fetchFeaturedProducts,
  fetchProductById,
  fetchProductOffers,
  fetchSimilarProducts,
  fetchTrendingLooks,
} from '@/lib/api/products';
import {
  CATEGORY_GRID_ENTRIES,
  categoryGridForShop,
} from '@/lib/constants/category-grid';
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
  const entries = suitableFor
    ? categoryGridForShop(suitableFor)
    : CATEGORY_GRID_ENTRIES;

  return useQuery({
    queryKey: productKeys.categoryGrid(suitableFor),
    queryFn: () => fetchCategoryPreviews(entries, suitableFor),
    staleTime: STALE_TIME_STATIC_MS,
    // Dame↔Herre keeps the previous 11 cards on screen until the matching
    // audience lands — count never collapses mid-toggle.
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
