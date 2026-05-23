import { useQuery } from '@tanstack/react-query';
import {
  fetchFeaturedProducts,
  fetchTrendingProducts,
  fetchProductById,
  fetchSearchResults,
  fetchSimilarProducts,
  fetchProductComparison,
  fetchPriceChartData,
} from '@/lib/api/products';
import { STALE_TIME_STATIC_MS } from '@/lib/query/client';
import { productKeys } from '@/lib/query/keys';

export { productKeys };

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => fetchFeaturedProducts(limit),
    staleTime: STALE_TIME_STATIC_MS,
  });
}

export function useTrendingProducts(limit = 6) {
  return useQuery({
    queryKey: productKeys.trending(),
    queryFn: () => fetchTrendingProducts(limit),
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

export function useSearchResults(query: string) {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: () => fetchSearchResults(query),
    staleTime: STALE_TIME_STATIC_MS,
    enabled: query.length > 1,
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

export function useProductComparison(id: string) {
  return useQuery({
    queryKey: productKeys.comparison(id),
    queryFn: () => fetchProductComparison(id),
    staleTime: STALE_TIME_STATIC_MS,
    enabled: !!id,
  });
}

export function usePriceChartData(id: string, days: 7 | 15 | 30 = 30) {
  return useQuery({
    queryKey: productKeys.chart(id, days),
    queryFn: () => fetchPriceChartData(id, days),
    staleTime: STALE_TIME_STATIC_MS,
    enabled: !!id,
  });
}
