import { useQuery } from '@tanstack/react-query';
import {
  fetchFeaturedProducts,
  fetchProductById,
  fetchSimilarProducts,
} from '@/lib/api/products';
import { POPULAR_PRODUCTS_LIMIT } from '@/lib/constants/featured';
import { STALE_TIME_STATIC_MS } from '@/lib/query/client';
import { productKeys } from '@/lib/query/keys';

export function useFeaturedProducts(limit = POPULAR_PRODUCTS_LIMIT) {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => fetchFeaturedProducts(limit),
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
