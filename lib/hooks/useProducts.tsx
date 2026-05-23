import { useQuery } from "@tanstack/react-query";
import {
  fetchFeaturedProducts,
  fetchTrendingProducts,
  fetchProductById,
  fetchSearchResults,
  fetchSimilarProducts,
  fetchProductComparison,
  fetchPriceChartData,
} from "@/lib/api/products";

export const productKeys = {
  all:        ["products"] as const,
  featured:   () => [...productKeys.all, "featured"] as const,
  trending:   () => [...productKeys.all, "trending"] as const,
  detail:     (id: string) => [...productKeys.all, "detail", id] as const,
  search:     (query: string) => [...productKeys.all, "search", query] as const,
  similar:    (id: string) => [...productKeys.all, "similar", id] as const,
  comparison: (id: string) => [...productKeys.all, "comparison", id] as const,
  chart:      (id: string, days: number) => [...productKeys.all, "chart", id, days] as const,
};

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn:  () => fetchFeaturedProducts(limit),
    staleTime: Infinity,
  });
}

export function useTrendingProducts(limit = 6) {
  return useQuery({
    queryKey: productKeys.trending(),
    queryFn:  () => fetchTrendingProducts(limit),
    staleTime: Infinity,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn:  () => fetchProductById(id),
    staleTime: Infinity,
    enabled:  !!id,
  });
}

export function useSearchResults(query: string) {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn:  () => fetchSearchResults(query),
    staleTime: Infinity,
    enabled:  query.length > 1,
  });
}

export function useSimilarProducts(id: string, limit = 4) {
  return useQuery({
    queryKey: productKeys.similar(id),
    queryFn:  () => fetchSimilarProducts(id, limit),
    staleTime: Infinity,
    enabled:  !!id,
  });
}

export function useProductComparison(id: string) {
  return useQuery({
    queryKey: productKeys.comparison(id),
    queryFn:  () => fetchProductComparison(id),
    staleTime: Infinity,
    enabled:  !!id,
  });
}

export function usePriceChartData(id: string, days: 7 | 15 | 30 = 30) {
  return useQuery({
    queryKey: productKeys.chart(id, days),
    queryFn:  () => fetchPriceChartData(id, days),
    staleTime: Infinity,
    enabled:  !!id,
  });
}