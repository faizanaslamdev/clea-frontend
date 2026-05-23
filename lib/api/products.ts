import {
  getHomeFeaturedProducts,
  getTrendingProducts,
  getProductById,
  searchProducts,
  getSimilarProducts,
  getProductComparison,
  getPriceChartData,
  getPriceAIInsights,
} from "@/lib/services";
import type { Product, SearchResult } from "@/lib/types";

export async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
  return getHomeFeaturedProducts(limit);
}

export async function fetchTrendingProducts(limit = 6): Promise<Product[]> {
  return getTrendingProducts(limit);
}

export async function fetchProductById(id: string): Promise<Product | undefined> {
  return getProductById(id);
}

export async function fetchSearchResults(query: string): Promise<SearchResult[]> {
  return searchProducts(query);
}

export async function fetchSimilarProducts(id: string, limit = 4): Promise<Product[]> {
  return getSimilarProducts(id, limit);
}

export async function fetchProductComparison(id: string) {
  return getProductComparison(id);
}

export async function fetchPriceChartData(id: string, days: 7 | 15 | 30 = 30) {
  return getPriceChartData(id, days);
}

export async function fetchPriceAIInsights(product: Product) {
  return getPriceAIInsights(product);
}