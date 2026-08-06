import { apiFetch, ApiError } from '@/lib/api/backend-client';
import { mapApiProductToProduct } from '@/lib/api/mappers';
import type {
  ApiProduct,
  ApiProductListResponse,
  ApiProductOffersResponse,
} from '@/lib/api/types';
import { CATALOG_PAGE_SIZE } from '@/lib/constants/catalog';
import {
  POPULAR_PRODUCTS_LIMIT,
  POPULAR_PRODUCTS_PER_BRAND,
} from '@/lib/constants/popular-brands';
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
  /** Cap each merchant before LIMIT — one round-trip multi-brand mix. */
  balanceMerchants?: boolean;
  perMerchantCandidateCap?: number;
}

function buildProductsQuery(params: FetchProductsParams): string {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.brand) search.set('brand', params.brand);
  if (params.merchantId) search.set('merchant_id', params.merchantId);
  if (params.category) search.set('category', params.category);
  if (params.balanceMerchants) search.set('balance_merchants', 'true');
  if (params.perMerchantCandidateCap != null) {
    search.set(
      'per_merchant_candidate_cap',
      String(params.perMerchantCandidateCap),
    );
  }
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
  init?: RequestInit,
): Promise<CatalogPageResult> {
  const qs = buildProductsQuery(params);
  const data = await apiFetch<ApiProductListResponse>(`/catalog?${qs}`, {
    ...(init ?? { cache: 'no-store' }),
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

export type ProductOffer = ApiProductOffersResponse['offers'][number];

export interface ProductOffersResult {
  anchor: ProductOffer;
  offers: ProductOffer[];
  compareReady: boolean;
  canonicalProductId: string | null;
}

export async function fetchProductOffers(
  id: string,
): Promise<ProductOffersResult> {
  const data = await apiFetch<ApiProductOffersResponse>(
    `/products/${id}/offers`,
    { cache: 'no-store' },
  );
  return {
    anchor: data.anchor,
    offers: data.offers,
    compareReady: data.compareReady,
    canonicalProductId: data.canonical_product_id,
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

/**
 * Home "Populært nå" — one balanced catalog request (no merchants waterfall).
 * Backend caps each merchant so the carousel mixes brands.
 */
export async function fetchFeaturedProducts(
  limit = POPULAR_PRODUCTS_LIMIT,
): Promise<Product[]> {
  const { products } = await fetchCatalogFromApi(
    {
      limit,
      balanceMerchants: true,
      perMerchantCandidateCap: POPULAR_PRODUCTS_PER_BRAND,
    },
    { next: { revalidate: 120 } },
  );
  return products;
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

