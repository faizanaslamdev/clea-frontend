import { fetchSearchResults } from '@/lib/api/products';
import type { SearchResult } from '@/lib/types';

export interface ProductSearchResponse {
  results: SearchResult[];
  usedFallback: boolean;
  total: number;
  hasMore: boolean;
}

export async function resolveProductSearch(
  query: string,
  options?: { offset?: number },
): Promise<ProductSearchResponse> {
  const page = await fetchSearchResults(query, options);
  return {
    results: page.results,
    usedFallback: page.usedFallback,
    total: page.total,
    hasMore: page.hasMore,
  };
}
