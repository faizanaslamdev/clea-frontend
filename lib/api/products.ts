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
  maxPrice?: number;
  suitableFor?: 'male' | 'female' | 'unisex';
}

function buildProductsQuery(params: FetchProductsParams): string {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.brand) search.set('brand', params.brand);
  if (params.merchantId) search.set('merchant_id', params.merchantId);
  if (params.category) search.set('category', params.category);
  if (params.productFamily) search.set('product_family', params.productFamily);
  if (params.maxPrice != null) search.set('max_price', String(params.maxPrice));
  if (params.suitableFor) search.set('suitable_for', params.suitableFor);
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
    if (image.includes('occtoo-media.com')) value += 5;
    if (image.includes('ralphlauren.scene7.com')) value += 5;
    if (image.includes('cdn.shopify.com')) value += 2;
    if (/kids|barn|teens|isbjörn|buddy tee/.test(name)) value -= 5;
    if (image.includes('outnorth') || image.includes('fjellsport')) value -= 1;
    if (family === 'footwear' && image.endsWith('.png')) value -= 1;
    if (family === 'knitwear' && /tank|tee|t-shirt|skjorte|fleece teddy/.test(name)) {
      value -= 3;
    }
    if (
      family === 'knitwear' &&
      /strikk|knit|genser|sweater|jumper|cardigan|hoodie/.test(name)
    ) {
      value += 4;
    }
    if (family === 'knitwear' && /haglöfs|haglofs|ortovox|mid jacket|sunpack/.test(name)) {
      value -= 3;
    }
    if (family === 'tops' && /bluse|blouse|top|skjorte|shirt/.test(name)) {
      value += 3;
    }
    if (family === 'bottoms' && /kjole|dress|bad|swim/.test(name)) value -= 3;
    if (
      family === 'bottoms' &&
      /jeans|chino|nederdel|skirt|bootcut|flare/.test(name)
    ) {
      value += 4;
    }
    if (
      family === 'bottoms' &&
      /härkila|harkila|halti|hunting|capri|short/.test(name)
    ) {
      value -= 3;
    }
    if (family === 'outerwear' && /jakke|jacket|coat|parkas|shell/.test(name)) {
      value += 2;
    }
    if (
      family === 'outerwear' &&
      /skinn|leather|skinnjakke|leather\s*jacket/.test(name)
    ) {
      value += 4;
    }
    if (
      family === 'outerwear' &&
      /skinn|leather/.test(preview) &&
      /softshell|gore|rain|regn|fleece/.test(name)
    ) {
      value -= 3;
    }
    if (
      family === 'footwear' &&
      /sandal|loafer|ballerina|heel|pump|sneaker|sko/.test(name) &&
      !/kids|barn/.test(name)
    ) {
      value += 3;
    }
    if (family === 'footwear' && /gaiter|kids|barn|viking footwear kids/.test(name)) {
      value -= 5;
    }
    if (family === 'bags' && /veske|bag|tote|crossbody|shoulder/.test(name)) {
      value += 3;
    }
    if (family === 'dresses' && /midi|dress|kjole|pleat/.test(name)) value += 3;
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
  suitableFor?: 'male' | 'female' | 'unisex',
): Promise<CategoryPreview[]> {
  const results = await Promise.all(
    entries.map(async (entry) => {
      const previewQ = previewQueryForEntry(entry);

      const load = async (gender?: 'male' | 'female' | 'unisex') => {
        try {
          const { products } = await fetchCatalogFromApi(
            {
              productFamily: entry.family,
              ...(previewQ ? { q: previewQ } : {}),
              ...(entry.previewBrand ? { brand: entry.previewBrand } : {}),
              ...(gender ? { suitableFor: gender } : {}),
              limit: Math.max(CATEGORY_PREVIEW_PHOTO_COUNT * 2, 12),
              balanceMerchants: !entry.previewBrand,
            },
            { next: { revalidate: 120 } },
          );
          return rankProductsForCategoryTile(
            products,
            entry.family,
            previewQ,
          ).slice(0, CATEGORY_PREVIEW_PHOTO_COUNT);
        } catch {
          return [] as Product[];
        }
      };

      // Switching Dame/Herre swaps the photos inside the tiles, never the
      // number of tiles -- so a family this audience has no stock in (say
      // Kjoler under Herre) falls back to the unfiltered shot instead of
      // silently dropping the card and reflowing the whole row.
      let ranked = suitableFor ? await load(suitableFor) : [];
      if (ranked.length === 0) {
        ranked = await load();
      }

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
    }),
  );

  return results.filter((entry): entry is CategoryPreview => entry !== null);
}

const TRENDING_LINGERIE_RE =
  /bra|bralette|bikini|truse|undertøy|lingerie|panty|bade|swim|wire|demi|thong|string|hunkemöller|hunkemoller|\bbh\b/i;
const TRENDING_KIDS_RE = /kids|barn|teens|isbjörn|isbjorn/i;
const TRENDING_ATHLETIC_RE =
  /mizuno|haglöfs|haglofs|salomon|columbia|fjällräven|fjallraven|craft\s|race day/i;

/** Magazine-card quality: fashion CDNs + apparel variety, skip lingerie/kids. */
function scoreTrendingLook(
  product: Pick<Product, 'image' | 'name' | 'merchantName' | 'brand'>,
): number {
  const image = product.image.toLowerCase();
  const name = product.name.toLowerCase();
  const merchant = (product.merchantName ?? product.brand).toLowerCase();
  let value = 0;
  if (image.includes('occtoo-media.com')) value += 8;
  if (image.includes('ralphlauren.scene7.com')) value += 8;
  if (image.includes('cdn.shopify.com')) value += 3;
  if (image.includes('outnorth') || image.includes('fjellsport')) value -= 6;
  if (image.endsWith('.png')) value -= 2;
  if (TRENDING_KIDS_RE.test(name)) value -= 12;
  if (TRENDING_LINGERIE_RE.test(name) || TRENDING_LINGERIE_RE.test(merchant)) {
    value -= 14;
  }
  if (TRENDING_ATHLETIC_RE.test(name) || TRENDING_ATHLETIC_RE.test(merchant)) {
    value -= 8;
  }
  if (
    /jeans|kjole|dress|jakke|jacket|genser|sweater|bluse|blouse|sandal|sko|hoodie|skjorte|shirt/.test(
      name,
    )
  ) {
    value += 4;
  }
  if (/nelly|nly man|ralph lauren|vero moda|only|jack & jones|levi/.test(merchant)) {
    value += 3;
  }
  return value;
}

function trendingLookFamily(name: string): string {
  const n = name.toLowerCase();
  if (/kjole|dress/.test(n)) return 'dress';
  if (/jeans|bukse|pants|dnm|denim|wide.?leg|skinny|bootcut|cargo|barrel/.test(n)) {
    return 'bottoms';
  }
  if (/jakke|jacket|puffer|coat|vester|vest|blazer/.test(n)) return 'outerwear';
  if (/genser|sweater|hoodie|knit|cardigan/.test(n)) return 'knit';
  if (/bluse|blouse|shirt|skjorte|top|tee/.test(n)) return 'tops';
  if (/sko|sandal|sneaker|boot/.test(n)) return 'footwear';
  return 'other';
}

function isTrendingLookEligible(
  product: Product,
  suitableFor?: 'male' | 'female' | 'unisex',
): boolean {
  if (!product.image || product.image.includes('placeholder')) return false;
  if (suitableFor) {
    const gender = product.suitableFor;
    if (gender && gender !== suitableFor && gender !== 'unisex') return false;
  }
  const name = product.name;
  const merchant = product.merchantName ?? product.brand;
  if (TRENDING_KIDS_RE.test(name)) return false;
  if (TRENDING_LINGERIE_RE.test(name) || TRENDING_LINGERIE_RE.test(merchant)) {
    return false;
  }
  if (TRENDING_ATHLETIC_RE.test(name) || TRENDING_ATHLETIC_RE.test(merchant)) {
    return false;
  }
  return scoreTrendingLook(product) > 0;
}

async function fetchTrendingLookSupplements(
  suitableFor?: 'male' | 'female' | 'unisex',
): Promise<Product[]> {
  const gender = suitableFor === 'unisex' ? undefined : suitableFor;
  const queries =
    suitableFor === 'male'
      ? [
          { q: 'jakke', brand: 'nly man' },
          { q: 'hoodie', brand: 'nly man' },
          { q: 'jeans', brand: 'nly man' },
        ]
      : [
          { q: 'kjole', brand: 'nelly' },
          { q: 'bluse', brand: 'nelly' },
          { q: 'jakke', brand: 'nelly' },
        ];

  const pages = await Promise.all(
    queries.map(({ q, brand }) =>
      fetchCatalogFromApi(
        {
          q,
          brand,
          ...(gender ? { suitableFor: gender } : {}),
          limit: 8,
        },
        { next: { revalidate: 120 } },
      ).catch(() => ({ products: [] as Product[] })),
    ),
  );

  return pages.flatMap((page) => page.products);
}

/**
 * Three real, in-stock, gender-filtered products for /shop's "Populært
 * akkurat nå" magazine section. Prefers popular-now fashion shots, then
 * supplements with Nelly / NLY Man catalog queries so the three cards are
 * not all jeans or outdoor packshots from merchant-balanced catalog.
 */
export async function fetchTrendingLooks(
  suitableFor?: 'male' | 'female' | 'unisex',
  count = 3,
): Promise<Product[]> {
  const [popular, supplements] = await Promise.all([
    fetchFeaturedProducts(Math.max(count * 12, 40)),
    fetchTrendingLookSupplements(suitableFor),
  ]);

  const byId = new Map<string, Product>();
  for (const product of [...popular, ...supplements]) {
    if (!byId.has(product.id)) byId.set(product.id, product);
  }

  const ranked = [...byId.values()]
    .filter((product) => isTrendingLookEligible(product, suitableFor))
    .sort((a, b) => scoreTrendingLook(b) - scoreTrendingLook(a));

  const picked: Product[] = [];
  const usedFamilies = new Set<string>();
  const usedImages = new Set<string>();
  const usedIds = new Set<string>();

  const take = (product: Product) => {
    picked.push(product);
    usedImages.add(product.image);
    usedIds.add(product.id);
  };

  const fillFrom = (pool: readonly Product[]) => {
    for (const product of pool) {
      if (picked.length >= count) return;
      if (usedIds.has(product.id) || usedImages.has(product.image)) continue;
      take(product);
    }
  };

  for (const product of ranked) {
    if (picked.length >= count) break;
    if (usedImages.has(product.image)) continue;
    const family = trendingLookFamily(product.name);
    if (family !== 'other' && usedFamilies.has(family)) continue;
    take(product);
    if (family !== 'other') usedFamilies.add(family);
  }

  // One family per card is a nice-to-have; three cards is not. Dame/Herre
  // must change what's in the row, never how long it is, so each fallback
  // drops one constraint at a time: family variety, then the audience
  // filter, then the quality gate.
  fillFrom(ranked);

  if (picked.length < count) {
    fillFrom(
      [...byId.values()]
        .filter((product) => isTrendingLookEligible(product))
        .sort((a, b) => scoreTrendingLook(b) - scoreTrendingLook(a)),
    );
  }

  if (picked.length < count) {
    fillFrom(
      [...byId.values()]
        .filter(
          (product) => product.image && !product.image.includes('placeholder'),
        )
        .sort((a, b) => scoreTrendingLook(b) - scoreTrendingLook(a)),
    );
  }

  return picked;
}

/** Catalog filters used to pick a query-matching photo for SearchBy cards. */
export interface SearchByPhotoParams {
  q?: string;
  brand?: string;
  productFamily?: ProductFamily;
  suitableFor?: 'male' | 'female' | 'unisex';
  maxPrice?: number;
  /** Boost products whose name matches this (e.g. /sandal|kjole/). */
  nameHint?: RegExp;
  /** Demote products whose name matches this (e.g. kids / perfume). */
  nameAvoid?: RegExp;
}

function scoreSearchByPhoto(
  product: { image: string; name: string },
  params: SearchByPhotoParams,
): number {
  const image = product.image.toLowerCase();
  const name = product.name.toLowerCase();
  let value = 0;
  if (image.includes('occtoo-media.com')) value += 6;
  if (image.includes('ralphlauren.scene7.com')) value += 6;
  if (image.includes('cdn.shopify.com')) value += 3;
  if (params.nameHint?.test(name)) value += 5;
  if (params.nameAvoid?.test(name)) value -= 8;
  if (/kids|barn|gift|eau de|blanket|scarf|perfume/.test(name)) value -= 5;
  if (image.includes('outnorth') || image.includes('fjellsport')) value -= 2;
  return value;
}

/** Best in-stock product image matching a SearchBy example query. */
export async function fetchSearchByCardPhoto(
  params: SearchByPhotoParams,
): Promise<string | null> {
  try {
    const { products } = await fetchCatalogFromApi(
      {
        q: params.q,
        brand: params.brand,
        productFamily: params.productFamily,
        suitableFor: params.suitableFor,
        maxPrice: params.maxPrice,
        limit: 16,
        balanceMerchants: true,
      },
      { next: { revalidate: 120 } },
    );
    const ranked = [...products].sort(
      (a, b) => scoreSearchByPhoto(b, params) - scoreSearchByPhoto(a, params),
    );
    return ranked[0]?.image ?? null;
  } catch {
    return null;
  }
}
