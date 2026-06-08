import { apiFetch, ApiError } from '@/lib/api/backend-client';
import { mapApiProductToProduct } from '@/lib/api/mappers';
import type { ApiProduct, ApiProductListResponse } from '@/lib/api/types';
import { CATALOG_PAGE_SIZE } from '@/lib/constants/catalog';
import {
  POPULAR_PRODUCTS_LIMIT,
  POPULAR_PRODUCTS_MERCHANT_ID,
} from '@/lib/constants/featured';
import type { Product, SearchResult } from '@/lib/types';

export type ProductSegment = 'fashion' | 'all';

export interface FetchProductsParams {
  q?: string;
  brand?: string;
  merchantId?: string;
  category?: string;
  /** Defaults to fashion — clothing/accessories only */
  segment?: ProductSegment;
  limit?: number;
  offset?: number;
}

function buildProductsQuery(params: FetchProductsParams): string {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.brand) search.set('brand', params.brand);
  if (params.merchantId) search.set('merchant_id', params.merchantId);
  if (params.category) search.set('category', params.category);
  search.set('segment', params.segment ?? 'fashion');
  search.set('limit', String(params.limit ?? CATALOG_PAGE_SIZE));
  search.set('offset', String(params.offset ?? 0));
  return search.toString();
}

export interface CatalogPageResult {
  products: Product[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/** Deduplicated catalog cards (one per merchant style). */
export async function fetchCatalogFromApi(
  params: FetchProductsParams = {},
): Promise<CatalogPageResult> {
  const qs = buildProductsQuery(params);
  const data = await apiFetch<ApiProductListResponse>(`/catalog?${qs}`, {
    cache: 'no-store',
  });
  const products = data.items.map(mapApiProductToProduct);
  const loaded = data.offset + products.length;

  return {
    products,
    total: data.total,
    limit: data.limit,
    offset: data.offset,
    hasMore: loaded < data.total,
  };
}

/** All variant rows — prefer fetchCatalogFromApi for listings */
export async function fetchProductsFromApi(
  params: FetchProductsParams = {},
): Promise<{ products: Product[]; total: number }> {
  const qs = buildProductsQuery(params);
  const data = await apiFetch<ApiProductListResponse>(`/products?${qs}`, {
    cache: 'no-store',
  });
  return {
    products: data.items.map(mapApiProductToProduct),
    total: data.total,
  };
}

export async function fetchProductById(
  id: string,
): Promise<Product | undefined> {
  try {
    const data = await apiFetch<ApiProduct>(
      `/products/${id}`,
      { cache: 'no-store' },
    );
    return mapApiProductToProduct(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

export async function fetchFeaturedProducts(
  limit = POPULAR_PRODUCTS_LIMIT,
): Promise<Product[]> {
  const { products } = await fetchCatalogFromApi({
    merchantId: POPULAR_PRODUCTS_MERCHANT_ID,
    limit,
  });
  return products;
}

export async function fetchTrendingProducts(
  limit = POPULAR_PRODUCTS_LIMIT,
): Promise<Product[]> {
  return fetchFeaturedProducts(limit);
}

function calculateRelevance(product: Product, query: string): number {
  const q = query.toLowerCase();
  let score = 0;

  if (product.name.toLowerCase().startsWith(q)) score += 3;
  else if (product.name.toLowerCase().includes(q)) score += 2;

  if (product.brand.toLowerCase() === q) score += 2;
  else if (product.brand.toLowerCase().includes(q)) score += 1;

  if (product.category.toLowerCase() === q) score += 1;

  return score;
}

export interface SearchPageResult {
  results: SearchResult[];
  usedFallback: boolean;
  total: number;
  hasMore: boolean;
  offset: number;
}

export async function fetchSearchResults(
  query: string,
  options?: { limit?: number; offset?: number },
): Promise<SearchPageResult> {
  const trimmed = query.trim();
  const limit = options?.limit ?? CATALOG_PAGE_SIZE;
  const offset = options?.offset ?? 0;

  if (!trimmed) {
    return {
      results: [],
      usedFallback: false,
      total: 0,
      hasMore: false,
      offset: 0,
    };
  }

  const page = await fetchCatalogFromApi({ q: trimmed, limit, offset });

  if (page.total > 0 || offset > 0) {
    const results = page.products
      .map((product) => ({
        product,
        relevance: calculateRelevance(product, trimmed),
      }))
      .sort((a, b) => b.relevance - a.relevance);
    return {
      results,
      usedFallback: false,
      total: page.total,
      hasMore: page.hasMore,
      offset: page.offset,
    };
  }

  if (offset > 0) {
    return {
      results: [],
      usedFallback: false,
      total: 0,
      hasMore: false,
      offset,
    };
  }

  const fallback = await fetchFeaturedProducts(8);
  return {
    results: fallback.map((product) => ({ product, relevance: 0 })),
    usedFallback: true,
    total: fallback.length,
    hasMore: false,
    offset: 0,
  };
}

export async function fetchSimilarProducts(
  id: string,
  limit = 4,
): Promise<Product[]> {
  const product = await fetchProductById(id);
  if (!product) return [];

  const brand = product.brand?.trim();
  if (!brand) return [];

  const { products } = await fetchCatalogFromApi({
    brand,
    limit: limit + 1,
  });

  return products.filter((p) => p.id !== id).slice(0, limit);
}

export async function fetchProductsByMerchant(
  merchantId: string,
  limit = 48,
): Promise<Product[]> {
  const { products } = await fetchCatalogFromApi({ merchantId, limit });
  return products;
}

export async function fetchSearchResultItems(
  query: string,
): Promise<SearchResult[]> {
  return (await fetchSearchResults(query)).results;
}
