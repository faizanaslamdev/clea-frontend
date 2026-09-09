import { useQuery } from '@tanstack/react-query';
import {
  fetchCategoryPreviews,
  fetchFeaturedProducts,
  fetchProductById,
  fetchProductOffers,
  fetchSimilarProducts,
} from '@/lib/api/products';
import { CATEGORY_GRID_ENTRIES } from '@/lib/constants/category-grid';
import { POPULAR_PRODUCTS_LIMIT } from '@/lib/constants/popular-brands';
import { STALE_TIME_STATIC_MS } from '@/lib/query/client';
import { productKeys } from '@/lib/query/keys';

export function useFeaturedProducts(limit = POPULAR_PRODUCTS_LIMIT) {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => fetchFeaturedProducts(limit),
    staleTime: STALE_TIME_STATIC_MS,
  });
}

export function useCategoryPreviews() {
  return useQuery({
    queryKey: productKeys.categoryGrid(),
    queryFn: () => fetchCategoryPreviews(CATEGORY_GRID_ENTRIES),
    staleTime: STALE_TIME_STATIC_MS,
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
