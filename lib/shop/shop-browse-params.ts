import { parseCatalogSort, type CatalogSort } from '@/lib/api/catalog-sort';
import type { SuitableFor } from '@/lib/api/chat-types';
import {
  shopCategoryChildrenFor,
  type ShopCategory,
} from '@/lib/constants/shop-categories';
import { parseShopColourParam } from '@/lib/shop/shop-colours';
import { shopFilterCapabilities } from '@/lib/shop/shop-filter-capabilities';
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
  /**
   * Canonical colour key (`black`, `blue`, …) for structured `colour` filter.
   * Only meaningful when the category enables colour.
   */
  colour?: string;
  /** Proven `old_price > price` sale filter. */
  onSale?: boolean;
  gender: SuitableFor;
}

export const SHOP_BROWSE_PARAM = {
  sub: 'sub',
  sort: 'sort',
  min: 'min',
  max: 'max',
  store: 'butikk',
  brand: 'merke',
  colour: 'farge',
  sale: 'salg',
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

function parseOnSaleParam(raw: string | null | undefined): boolean {
  if (raw == null) return false;
  const value = raw.trim().toLowerCase();
  return value === '1' || value === 'true' || value === 'ja';
}

export function parseShopBrowseState(
  params: URLSearchParams,
  category: ShopCategory,
): ShopBrowseState {
  const capabilities = shopFilterCapabilities(category);
  const visibleChildren = shopCategoryChildrenFor(category, parseShopGenderParam(params.get(SHOP_BROWSE_PARAM.gender)));

  const subSlug = params.get(SHOP_BROWSE_PARAM.sub);
  const sub =
    capabilities.subcategory &&
    visibleChildren.some((child) => child.slug === subSlug)
      ? (subSlug ?? undefined)
      : undefined;

  const { minPrice, maxPrice } = commitPriceRange(
    params.get(SHOP_BROWSE_PARAM.min) ?? '',
    params.get(SHOP_BROWSE_PARAM.max) ?? '',
  );

  const brand = params.get(SHOP_BROWSE_PARAM.brand)?.trim() || undefined;
  const colour = capabilities.colour
    ? parseShopColourParam(params.get(SHOP_BROWSE_PARAM.colour))
    : undefined;
  const onSale = capabilities.sale
    ? parseOnSaleParam(params.get(SHOP_BROWSE_PARAM.sale))
    : false;

  return {
    sub,
    sort: parseCatalogSort(params.get(SHOP_BROWSE_PARAM.sort)),
    minPrice,
    maxPrice,
    merchantId: params.get(SHOP_BROWSE_PARAM.store) ?? undefined,
    brand,
    colour,
    onSale: onSale || undefined,
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
  if (state.colour) params.set(SHOP_BROWSE_PARAM.colour, state.colour);
  if (state.onSale) params.set(SHOP_BROWSE_PARAM.sale, '1');
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
 *
 * Colour uses `colourFieldOnly` so Shop never infers colour from titles.
 */
export function shopBrowseFilters(
  category: ShopCategory,
  state: ShopBrowseState,
): CatalogQueryFilters {
  const capabilities = shopFilterCapabilities(category);
  const child = state.sub
    ? shopCategoryChildrenFor(category, state.gender).find(
        (entry) => entry.slug === state.sub,
      )
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
    colour: capabilities.colour ? state.colour : undefined,
    colourFieldOnly: capabilities.colour && state.colour ? true : undefined,
    onSale: capabilities.sale && state.onSale ? true : undefined,
    sort: state.sort,
  };
}

export function isShopBrowseFiltered(state: ShopBrowseState): boolean {
  return Boolean(
    state.sub ||
      state.merchantId ||
      state.brand ||
      state.colour ||
      state.onSale ||
      state.minPrice != null ||
      state.maxPrice != null ||
      state.sort !== 'relevance',
  );
}

/**
 * Count of secondary filters shown in the Filter drawer.
 * Excludes subcategory chips and gender (page context, not drawer filters).
 * Price min/max counts as one constraint. Default relevance sort does not count.
 */
export function countShopDrawerFilters(state: ShopBrowseState): number {
  let count = 0;
  if (state.brand) count += 1;
  if (state.merchantId) count += 1;
  if (state.colour) count += 1;
  if (state.onSale) count += 1;
  if (state.minPrice != null || state.maxPrice != null) count += 1;
  if (state.sort !== 'relevance') count += 1;
  return count;
}
