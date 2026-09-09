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
  id: string;
  /** Present for apparel tiles; omitted for beauty/accessories shelves. */
  family?: ProductFamily;
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

/** Total fetched per category — tile uses 3; spare headroom for FeatureTabs. */
const CATEGORY_PREVIEW_PHOTO_COUNT = 6;

/** Cap parallel catalog calls so shop's 11 tiles don't trip the API throttle. */
const CATEGORY_PREVIEW_CONCURRENCY = 4;

/** Pull a catalog `q` from "Vis meg …" chat copy when no explicit previewQ. */
function previewQueryForEntry(entry: CategoryGridEntry): string | undefined {
  if (entry.previewQ?.trim()) {
    return entry.previewQ.trim();
  }
  const match = entry.query.match(/^vis meg\s+(.+)$/i);
  return match?.[1]?.trim() || undefined;
}

async function mapPool<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index]);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

/**
 * Prefer fashion-CDN / on-family shots for homepage tiles. Family-only
 * ranking often surfaces outdoor packshots first; this reorders the pool.
 */
function rankProductsForCategoryTile<T extends { image: string; name: string }>(
  products: T[],
  family?: ProductFamily,
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
    if (!family) return value;
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
 * Representative in-stock products per category tile.
 *
 * Shop (gender set): one fast merchant pool (~Nelly / NLY Man), then assign
 * photos to the fixed 11 cards — avoids 11 slow family queries + throttle
 * cascades on reload. Sparse families gap-fill with a small concurrent pool.
 *
 * Homepage (no gender): capped per-family fetches as before.
 */
export async function fetchCategoryPreviews(
  entries: readonly CategoryGridEntry[],
  suitableFor?: 'male' | 'female' | 'unisex',
): Promise<CategoryPreview[]> {
  if (suitableFor === 'male' || suitableFor === 'female') {
    return fetchShopCategoryPreviews(entries, suitableFor);
  }
  return fetchHomepageCategoryPreviews(entries);
}

const SHOP_PREVIEW_MERCHANT_ID: Record<'male' | 'female', string> = {
  female: '19563', // Nelly NO
  male: '19567', // NLY Man NO
};

function productBlob(product: Product): string {
  return `${product.name} ${product.productType ?? ''} ${product.categoryPath ?? ''}`.toLowerCase();
}

function productMatchesShopEntry(
  product: Product,
  entry: CategoryGridEntry,
  previewQ?: string,
): boolean {
  const blob = productBlob(product);
  if (previewQ) {
    const tokens = previewQ
      .toLowerCase()
      .split(/[^a-z0-9æøåäöü]+/i)
      .filter((token) => token.length >= 3);
    if (tokens.some((token) => blob.includes(token))) {
      // Guard common false-positives from short tokens (e.g. "boot" in Bootcut).
      if (
        entry.family === 'footwear' &&
        /bootcut|jeans/.test(blob) &&
        !/sandal|sneaker|sko|shoe|boot\b|pensko|loafer/.test(blob)
      ) {
        return false;
      }
      if (
        entry.family === 'tops' &&
        /bikini|bra|\bbh\b|badetøy|swim/.test(blob)
      ) {
        return false;
      }
      return true;
    }
  }

  switch (entry.family) {
    case 'dresses':
      return /kjole|dress/.test(blob);
    case 'tops':
      return (
        /bluse|blouse|\btop\b|t-shirt|\btee\b|skjorte|\bshirt\b/.test(blob) &&
        !/bikini|bra|\bbh\b|badetøy|swim/.test(blob)
      );
    case 'knitwear':
      return /genser|sweater|hoodie|strikk|knit|cardigan/.test(blob);
    case 'bottoms':
      return /jeans|bukse|pants|nederdel|skirt|chino|short/.test(blob);
    case 'outerwear':
      return /jakke|jacket|coat|puffer|parkas|blazer|vester|\bvest\b/.test(blob);
    case 'underwear':
      return /bra|\bbh\b|bralette|truse|boxer|undertøy|briefs|panty/.test(blob);
    case 'footwear':
      return /sandal|sneaker|\bsko\b|shoe|\bboot\b|loafer|pensko/.test(blob);
    case 'bags':
      return /veske|\bbag\b|clutch|tote|handleveske/.test(blob);
    case 'legwear':
      return /legging|strømpe|tights/.test(blob);
    case 'socks':
      return /sokk|sock/.test(blob);
    case 'gloves':
      return /hanske|glove/.test(blob);
    default:
      return false;
  }
}

function pickShopEntryProducts(
  pool: readonly Product[],
  entry: CategoryGridEntry,
  usedImages: Set<string>,
): Product[] {
  const previewQ = previewQueryForEntry(entry);
  const candidates = pool.filter(
    (product) =>
      Boolean(product.image) &&
      !usedImages.has(product.image) &&
      productMatchesShopEntry(product, entry, previewQ),
  );
  return rankProductsForCategoryTile(
    candidates,
    entry.family,
    previewQ,
  ).slice(0, CATEGORY_PREVIEW_PHOTO_COUNT);
}

function toCategoryPreview(
  entry: CategoryGridEntry,
  ranked: Product[],
): CategoryPreview | null {
  const [first] = ranked;
  if (!first) return null;
  return {
    id: entry.id,
    family: entry.family,
    label: entry.label,
    query: entry.query,
    accentFrom: entry.accentFrom,
    accentTo: entry.accentTo,
    images: ranked.map((product) => product.image),
    productId: first.id,
  };
}

async function fetchShopCategoryPreviews(
  entries: readonly CategoryGridEntry[],
  suitableFor: 'male' | 'female',
): Promise<CategoryPreview[]> {
  let pool: Product[] = [];
  try {
    const page = await fetchCatalogFromApi(
      {
        merchantId: SHOP_PREVIEW_MERCHANT_ID[suitableFor],
        suitableFor,
        limit: 80,
        balanceMerchants: false,
      },
      { next: { revalidate: 120 } },
    );
    pool = page.products;
  } catch {
    pool = [];
  }

  const usedImages = new Set<string>();
  const byId = new Map<string, CategoryPreview>();
  const gaps: CategoryGridEntry[] = [];

  for (const entry of entries) {
    const ranked = pickShopEntryProducts(pool, entry, usedImages);
    const preview = toCategoryPreview(entry, ranked);
    if (preview) {
      ranked.forEach((product) => usedImages.add(product.image));
      byId.set(entry.id, preview);
    } else {
      gaps.push(entry);
    }
  }

  if (gaps.length > 0) {
    const merchantId = SHOP_PREVIEW_MERCHANT_ID[suitableFor];
    const gapResults = await mapPool(gaps, 3, async (entry) => {
      const previewQ = previewQueryForEntry(entry);
      try {
        const { products } = await fetchCatalogFromApi(
          {
            merchantId,
            ...(previewQ ? { q: previewQ } : { productFamily: entry.family }),
            suitableFor,
            limit: CATEGORY_PREVIEW_PHOTO_COUNT,
            balanceMerchants: false,
          },
          { next: { revalidate: 120 } },
        );
        const ranked = rankProductsForCategoryTile(
          products.filter((product) => !usedImages.has(product.image)),
          entry.family,
          previewQ,
        ).slice(0, CATEGORY_PREVIEW_PHOTO_COUNT);
        const preview = toCategoryPreview(entry, ranked);
        ranked.forEach((product) => usedImages.add(product.image));
        return preview;
      } catch {
        return null;
      }
    });

    for (const preview of gapResults) {
      if (preview) byId.set(preview.id, preview);
    }
  }

  return entries
    .map((entry) => byId.get(entry.id) ?? null)
    .filter((entry): entry is CategoryPreview => entry !== null);
}

async function fetchHomepageCategoryPreviews(
  entries: readonly CategoryGridEntry[],
): Promise<CategoryPreview[]> {
  const results = await mapPool(
    entries,
    CATEGORY_PREVIEW_CONCURRENCY,
    async (entry) => {
      const previewQ = previewQueryForEntry(entry);

      const load = async (opts: { brand?: string }) => {
        try {
          const { products } = await fetchCatalogFromApi(
            {
              productFamily: entry.family,
              ...(previewQ ? { q: previewQ } : {}),
              ...(opts.brand ? { brand: opts.brand } : {}),
              limit: CATEGORY_PREVIEW_PHOTO_COUNT,
              balanceMerchants: false,
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

      let ranked = await load(
        entry.previewBrand ? { brand: entry.previewBrand } : {},
      );
      if (ranked.length === 0 && entry.previewBrand) {
        ranked = await load({});
      }

      return toCategoryPreview(entry, ranked);
    },
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
  const merchantId =
    suitableFor === 'male'
      ? SHOP_PREVIEW_MERCHANT_ID.male
      : SHOP_PREVIEW_MERCHANT_ID.female;
  const queries =
    suitableFor === 'male'
      ? [{ q: 'jakke' }, { q: 'hoodie' }, { q: 'jeans' }]
      : [{ q: 'kjole' }, { q: 'bluse' }, { q: 'jakke' }];

  const pages = await Promise.all(
    queries.map(({ q }) =>
      fetchCatalogFromApi(
        {
          q,
          merchantId,
          ...(gender ? { suitableFor: gender } : {}),
          limit: 8,
          balanceMerchants: false,
        },
        { next: { revalidate: 120 } },
      ).catch(() => ({ products: [] as Product[] })),
    ),
  );

  return pages.flatMap((page) => page.products);
}

/**
 * Three real, in-stock, gender-filtered products for /shop's "Populært
 * akkurat nå". Uses fast brand catalog queries only — popular-now ranks a
 * large candidate pool and commonly takes several seconds, which made the
 * whole shop reload feel stuck behind one endpoint.
 */
export async function fetchTrendingLooks(
  suitableFor?: 'male' | 'female' | 'unisex',
  count = 3,
): Promise<Product[]> {
  const supplements = await fetchTrendingLookSupplements(suitableFor);

  const byId = new Map<string, Product>();
  for (const product of supplements) {
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
