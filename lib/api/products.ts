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
} from '@/lib/constants/popular-brands';
import type { Product, SearchResult } from '@/lib/types';
import type { ProductFamily } from '@/lib/api/chat-types';
import type { CategoryGridEntry } from '@/lib/constants/category-grid';

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
  /** Normalized product family (footwear, dresses, ...) — see chat ontology. */
  productFamily?: ProductFamily;
}

function buildProductsQuery(params: FetchProductsParams): string {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.brand) search.set('brand', params.brand);
  if (params.merchantId) search.set('merchant_id', params.merchantId);
  if (params.category) search.set('category', params.category);
  if (params.productFamily) search.set('product_family', params.productFamily);
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
 * Home "Populært nå" — platform-level popularity with discovery cold-start.
 */
export async function fetchFeaturedProducts(
  limit = POPULAR_PRODUCTS_LIMIT,
): Promise<Product[]> {
  const search = new URLSearchParams();
  search.set('limit', String(limit));
  search.set('offset', '0');

  const data = await apiFetch<ApiProductListResponse>(
    `/catalog/popular-now?${search.toString()}`,
    { next: { revalidate: 120 } },
  );
  return data.items.map(mapApiProductToProduct);
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


export interface CategoryPreview {
  family: ProductFamily;
  label: string;
  query: string;
  accentFrom: string;
  accentTo: string;
  /** Up to CATEGORY_PREVIEW_PHOTO_COUNT in-stock product photos — [0] is
   *  the front/center card for the category tile fan (images 0-2; see
   *  CATEGORY_SECTION_DISPLAY_COUNT), [1] and [2] fan out behind it. Any
   *  images beyond that are extra headroom reused by FeatureTabsSection's
   *  Explore/Compare tabs so they don't repeat the same photos already
   *  shown by the category tile. Always has at least 1 entry. */
  images: string[];
  productId: string;
}

/** How many of each category's images the tile itself displays (center + 2 fan). */
export const CATEGORY_SECTION_DISPLAY_COUNT = 3;

/** Total fetched per category — extra beyond CATEGORY_SECTION_DISPLAY_COUNT
 *  is spare headroom for FeatureTabsSection to reuse without duplicating. */
const CATEGORY_PREVIEW_PHOTO_COUNT = 6;

/** Pull a catalog `q` from "Vis meg …" chat copy when no explicit previewQ. */
function previewQueryForEntry(entry: CategoryGridEntry): string | undefined {
  if (entry.previewQ?.trim()) {
    return entry.previewQ.trim();
  }
  const match = entry.query.match(/^vis meg\s+(.+)$/i);
  return match?.[1]?.trim() || undefined;
}

/**
 * Prefer fashion-CDN / on-family shots for homepage tiles. Family-only
 * ranking often surfaces outdoor packshots first; this reorders the pool.
 */
function rankProductsForCategoryTile<T extends { image: string; name: string }>(
  products: T[],
  family: ProductFamily,
  previewQ?: string,
): T[] {
  const preview = (previewQ ?? '').toLowerCase();
  const braFocused = /bra|bh|bralette/.test(preview);
  const briefsFocused = /truse|truser|briefs|boxers|undertøy/.test(preview);

  const score = (product: T): number => {
    let value = 0;
    const image = product.image.toLowerCase();
    const name = product.name.toLowerCase();
    if (image.includes('occtoo-media.com')) value += 4;
    if (image.includes('ralphlauren.scene7.com')) value += 3;
    if (image.includes('cdn.shopify.com')) value += 2;
    if (family === 'footwear' && image.endsWith('.png')) value -= 1;
    if (family === 'knitwear' && /tank|tee|t-shirt|skjorte/.test(name)) value -= 2;
    if (
      family === 'knitwear' &&
      /strikk|knit|genser|sweater|jumper|hoodie/.test(name)
    ) {
      value += 3;
    }
    if (family === 'bottoms' && /kjole|dress|bad|swim/.test(name)) value -= 3;
    if (
      family === 'bottoms' &&
      /bukse|jeans|pants|chino|nederdel|skirt/.test(name)
    ) {
      value += 3;
    }
    if (family === 'outerwear' && /jakke|jacket|coat|parkas|shell/.test(name)) {
      value += 2;
    }
    if (
      family === 'underwear' &&
      /bra|bh|bralette|truse|undertøy|bikini|lingerie|boxers|briefs/.test(name)
    ) {
      value += 3;
    }
    if (
      family === 'underwear' &&
      /cap|hoodie|jacket|jakke|tee|tank|base layer|set long|sport top/.test(name)
    ) {
      value -= 3;
    }
    if (braFocused && /bra|bh|bralette/.test(name)) value += 4;
    if (braFocused && /wire|wired|bøyle|spiler|push.?up|balconette|lace|blonde|bikini/.test(name)) {
      value += 5;
    }
    if (braFocused && /sports?\s*bra|sportsbra|high support|training|hypervent/.test(name)) {
      value -= 6;
    }
    if (braFocused && /truse|panty|briefs|boxers/.test(name)) value -= 2;
    if (briefsFocused && /truse|panty|briefs|boxers|trunks/.test(name)) value += 4;
    if (briefsFocused && /bra|bralette|sports bra/.test(name)) value -= 2;
    return value;
  };

  return [...products].sort((a, b) => score(b) - score(a));
}

/**
 * Representative in-stock products per homepage category tile — enough to
 * fan a small photo stack the way daydream.ing does, plus spare headroom
 * (see CATEGORY_PREVIEW_PHOTO_COUNT). A family with no matching products is
 * silently dropped — the carousel renders whatever it actually has real
 * inventory for.
 */
export async function fetchCategoryPreviews(
  entries: readonly CategoryGridEntry[],
): Promise<CategoryPreview[]> {
  const results = await Promise.all(
    entries.map(async (entry) => {
      try {
        const previewQ = previewQueryForEntry(entry);
        const { products } = await fetchCatalogFromApi(
          {
            productFamily: entry.family,
            ...(previewQ ? { q: previewQ } : {}),
            limit: Math.max(CATEGORY_PREVIEW_PHOTO_COUNT * 2, 12),
            balanceMerchants: true,
          },
          { next: { revalidate: 120 } },
        );
        const ranked = rankProductsForCategoryTile(
          products,
          entry.family,
          previewQ,
        ).slice(0, CATEGORY_PREVIEW_PHOTO_COUNT);
        const [first] = ranked;
        if (!first) return null;

        return {
          family: entry.family,
          label: entry.label,
          query: entry.query,
          accentFrom: entry.accentFrom,
          accentTo: entry.accentTo,
          images: ranked.map((product) => product.image),
          productId: first.id,
        } satisfies CategoryPreview;
      } catch {
        return null;
      }
    }),
  );

  return results.filter((entry): entry is CategoryPreview => entry !== null);
}
