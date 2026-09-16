import { parseCatalogSort, type CatalogSort } from '@/lib/api/catalog-sort';
import type { SuitableFor } from '@/lib/api/chat-types';
import type { ShopCategory } from '@/lib/constants/shop-categories';
import { parseShopGenderParam, shopGenderParamFor } from '@/lib/shop/shop-gender';
import type { CatalogQueryFilters } from '@/lib/query/keys';

/**
 * URL state for `/shop/[category]`. Filters live in the query string so a
 * filtered view is shareable and refreshable. Filter updates use
 * `router.replace` (not `push`) so Back from a product returns to this
 * filtered URL without a stack of every refinement.
 */
export interface ShopBrowseState {
  /** Sub-category slug from the active category's children. */
  sub?: string;
  sort: CatalogSort;
  minPrice?: number;
  maxPrice?: number;
  /** Merchant id — the API takes one store at a time. */
  merchantId?: string;
  /** Catalog brand string for `brand_values` (exact LOWER match). */
  brand?: string;
  gender: SuitableFor;
}

export const SHOP_BROWSE_PARAM = {
  sub: 'sub',
  sort: 'sort',
  min: 'min',
  max: 'max',
  store: 'butikk',
  brand: 'merke',
  gender: 'gender',
} as const;

/** Committed price only — empty / non-positive / NaN means no constraint. */
export function parseCommittedPrice(raw: string | null | undefined): number | undefined {
  if (raw == null || raw.trim() === '') return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return Math.floor(value);
}

/**
 * Normalize a draft min/max pair for URL/API commit.
 * Invalid or reversed ranges drop the conflicting bound rather than querying empty.
 */
export function commitPriceRange(
  minRaw: string,
  maxRaw: string,
): { minPrice?: number; maxPrice?: number } {
  let minPrice = parseCommittedPrice(minRaw);
  let maxPrice = parseCommittedPrice(maxRaw);

  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    // Prefer the field the shopper likely just finished — keep max, drop min.
    minPrice = undefined;
  }

  return { minPrice, maxPrice };
}

export function parseShopBrowseState(
  params: URLSearchParams,
  category: ShopCategory,
): ShopBrowseState {
  const subSlug = params.get(SHOP_BROWSE_PARAM.sub);
  const sub = category.children.some((child) => child.slug === subSlug)
    ? (subSlug ?? undefined)
    : undefined;

  const { minPrice, maxPrice } = commitPriceRange(
    params.get(SHOP_BROWSE_PARAM.min) ?? '',
    params.get(SHOP_BROWSE_PARAM.max) ?? '',
  );

  const brand = params.get(SHOP_BROWSE_PARAM.brand)?.trim() || undefined;

  return {
    sub,
    sort: parseCatalogSort(params.get(SHOP_BROWSE_PARAM.sort)),
    minPrice,
    maxPrice,
    merchantId: params.get(SHOP_BROWSE_PARAM.store) ?? undefined,
    brand,
    gender: parseShopGenderParam(params.get(SHOP_BROWSE_PARAM.gender)),
  };
}

/** Serialise state back to a query string, omitting defaults to keep URLs short. */
export function buildShopBrowseQuery(state: ShopBrowseState): string {
  const params = new URLSearchParams();
  if (state.sub) params.set(SHOP_BROWSE_PARAM.sub, state.sub);
  if (state.sort !== 'relevance') params.set(SHOP_BROWSE_PARAM.sort, state.sort);
  if (state.minPrice != null) params.set(SHOP_BROWSE_PARAM.min, String(state.minPrice));
  if (state.maxPrice != null) params.set(SHOP_BROWSE_PARAM.max, String(state.maxPrice));
  if (state.merchantId) params.set(SHOP_BROWSE_PARAM.store, state.merchantId);
  if (state.brand) params.set(SHOP_BROWSE_PARAM.brand, state.brand);
  // Dame is the default; only pin the param when the shopper picked Herre.
  if (state.gender === 'male') {
    params.set(SHOP_BROWSE_PARAM.gender, shopGenderParamFor(state.gender));
  }
  return params.toString();
}

/**
 * Map browse state to catalog filters.
 *
 * `segment: 'all'` is deliberate: the ontology id is already a precise filter,
 * while the `fashion` segment layers fuzzy merchant-category LIKE matching on
 * top that can drop correctly-tagged products (and excludes beauty entirely).
 */
export function shopBrowseFilters(
  category: ShopCategory,
  state: ShopBrowseState,
): CatalogQueryFilters {
  const child = state.sub
    ? category.children.find((entry) => entry.slug === state.sub)
    : undefined;

  return {
    ontologyCategoryIds: [child?.ontologyId ?? category.ontologyId],
    segment: 'all',
    // Beauty / watches / accessories have no suitable_for value in the catalog,
    // so sending one would return an empty grid.
    suitableFor: category.gendered ? state.gender : undefined,
    merchantId: state.merchantId,
    brandValues: state.brand ? [state.brand] : undefined,
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
    sort: state.sort,
  };
}

export function isShopBrowseFiltered(state: ShopBrowseState): boolean {
  return Boolean(
    state.sub ||
      state.merchantId ||
      state.brand ||
      state.minPrice != null ||
      state.maxPrice != null ||
      state.sort !== 'relevance',
  );
}
