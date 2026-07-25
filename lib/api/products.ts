import { apiFetch, ApiError } from '@/lib/api/backend-client';
import { mapApiProductToProduct } from '@/lib/api/mappers';
import { fetchAllStoresFromApi } from '@/lib/api/stores';
import type { ApiProduct, ApiProductListResponse } from '@/lib/api/types';
import { CATALOG_PAGE_SIZE } from '@/lib/constants/catalog';
import {
  POPULAR_PRODUCTS_LIMIT,
  POPULAR_PRODUCTS_PER_BRAND,
  POPULAR_SECTION_BRANDS,
} from '@/lib/constants/popular-brands';
import {
  dedupeProductsById,
  interleaveProductGroups,
} from '@/lib/domain/products/popular-curation';
import {
  resolvePreferredStores,
  storeHasProducts,
} from '@/lib/domain/stores/merchant-match';
import type { Product, SearchResult, Store } from '@/lib/types';

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

async function fetchProductsForStore(
  store: Store,
  limit: number,
): Promise<Product[]> {
  if (limit <= 0 || !storeHasProducts(store)) {
    return [];
  }
  const { products } = await fetchCatalogFromApi({
    merchantId: store.id,
    limit,
  });
  return products;
}

/**
 * Home "Populært nå" — curated from preferred brands (then other merchants),
 * interleaved so the carousel is not a single-brand block.
 */
export async function fetchFeaturedProducts(
  limit = POPULAR_PRODUCTS_LIMIT,
): Promise<Product[]> {
  const stores = await fetchAllStoresFromApi();
  const preferred = resolvePreferredStores(stores, POPULAR_SECTION_BRANDS);
  const preferredIds = new Set(preferred.map((store) => store.id));

  const preferredGroups = await Promise.all(
    preferred.map((store) =>
      fetchProductsForStore(store, POPULAR_PRODUCTS_PER_BRAND),
    ),
  );

  const groups: Product[][] = preferredGroups.filter(
    (group) => group.length > 0,
  );
  let remaining =
    limit - groups.reduce((sum, group) => sum + group.length, 0);

  if (remaining > 0) {
    const fallbackStores = stores
      .filter((store) => storeHasProducts(store) && !preferredIds.has(store.id))
      .sort((a, b) => (b.productCount ?? 0) - (a.productCount ?? 0));

    for (const store of fallbackStores) {
      if (remaining <= 0) break;
      const take = Math.min(POPULAR_PRODUCTS_PER_BRAND, remaining);
      const products = await fetchProductsForStore(store, take);
      if (products.length === 0) continue;
      groups.push(products);
      remaining -= products.length;
    }
  }

  return dedupeProductsById(interleaveProductGroups(groups)).slice(0, limit);
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
  try {
    const data = await apiFetch<ApiProductListResponse>(
      `/products/${id}/similar?limit=${limit}`,
      { cache: 'no-store' },
    );
    return data.items.map(mapApiProductToProduct);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function fetchProductsByMerchant(
  merchantId: string,
  limit = 48,
): Promise<Product[]> {
  const { products } = await fetchCatalogFromApi({ merchantId, limit });
  return products;
}

