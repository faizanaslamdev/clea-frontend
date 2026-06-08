import { useQuery } from '@tanstack/react-query';
import {
  fetchFeaturedProducts,
  fetchTrendingProducts,
  fetchProductById,
  fetchSearchResultItems,
  fetchSimilarProducts,
} from '@/lib/api/products';
import {
  getProductComparison,
  getPriceChartData,
} from '@/lib/domain/products/comparison';
import { POPULAR_PRODUCTS_LIMIT } from '@/lib/constants/featured';
import { STALE_TIME_STATIC_MS } from '@/lib/query/client';
import { productKeys } from '@/lib/query/keys';

export { productKeys };

export function useFeaturedProducts(limit = POPULAR_PRODUCTS_LIMIT) {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => fetchFeaturedProducts(limit),
    staleTime: STALE_TIME_STATIC_MS,
  });
}

export function useTrendingProducts(limit = POPULAR_PRODUCTS_LIMIT) {
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
    queryFn: () => fetchSearchResultItems(query),
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
    queryFn: () => getProductComparison(id),
    staleTime: STALE_TIME_STATIC_MS,
    enabled: !!id,
  });
}

export function usePriceChartData(id: string, days: 7 | 15 | 30 = 30) {
  return useQuery({
    queryKey: productKeys.chart(id, days),
    queryFn: () => getPriceChartData(id, days),
    staleTime: STALE_TIME_STATIC_MS,
    enabled: !!id,
  });
}
