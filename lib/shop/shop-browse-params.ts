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
  /** Selected stores (merchant ids). Empty = all stores. */
  merchantIds: string[];
  /** Selected brands, as the facet labels them. Empty = all brands. */
  brands: string[];
  /** Selected colour families (`black`, `blue`, `gold`, `multi`…). */
  colours: string[];
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

/**
 * Multi-value URL param: repeated (`merke=a&merke=b`) or legacy comma list
 * for stores/colours. Brands are never comma-split (names can contain commas).
 */
function readList(
  params: URLSearchParams,
  key: string,
  splitCommas: boolean,
): string[] {
  const values = params
    .getAll(key)
    .flatMap((value) => (splitCommas ? value.split(',') : [value]))
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set(values)];
}

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

  const colours = capabilities.colour
    ? readList(params, SHOP_BROWSE_PARAM.colour, true)
        .map((value) => parseShopColourParam(value))
        .filter((value): value is string => Boolean(value))
    : [];
  const onSale = capabilities.sale
    ? parseOnSaleParam(params.get(SHOP_BROWSE_PARAM.sale))
    : false;

  return {
    sub,
    sort: parseCatalogSort(params.get(SHOP_BROWSE_PARAM.sort)),
    minPrice,
    maxPrice,
    merchantIds: readList(params, SHOP_BROWSE_PARAM.store, true),
    brands: dedupeCaseInsensitive(readList(params, SHOP_BROWSE_PARAM.brand, false)),
    colours: [...new Set(colours)],
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
  if (state.merchantIds.length) {
    params.set(SHOP_BROWSE_PARAM.store, state.merchantIds.join(','));
  }
  for (const brand of state.brands) params.append(SHOP_BROWSE_PARAM.brand, brand);
  if (state.colours.length) {
    params.set(SHOP_BROWSE_PARAM.colour, state.colours.join(','));
  }
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
 * Colour uses the stored colour family (decided at import), never a
 * query-time guess from titles.
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
    merchantIds: state.merchantIds.length ? [...state.merchantIds].sort() : undefined,
    brandValues: state.brands.length ? [...state.brands].sort() : undefined,
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
    colourFamilies:
      capabilities.colour && state.colours.length ? [...state.colours].sort() : undefined,
    onSale: capabilities.sale && state.onSale ? true : undefined,
    sort: state.sort,
  };
}

export function isShopBrowseFiltered(state: ShopBrowseState): boolean {
  return Boolean(
    state.sub ||
      state.merchantIds.length ||
      state.brands.length ||
      state.colours.length ||
      state.onSale ||
      state.minPrice != null ||
      state.maxPrice != null ||
      state.sort !== 'relevance',
  );
}

/**
 * Count of secondary filters shown in the Filter drawer.
 * Excludes subcategory chips and gender (page context, not drawer filters).
 * Each selected store / brand / colour counts; price min/max counts as one. Default relevance sort does not count.
 */
export function countShopDrawerFilters(state: ShopBrowseState): number {
  let count = 0;
  count += state.brands.length;
  count += state.merchantIds.length;
  count += state.colours.length;
  if (state.onSale) count += 1;
  if (state.minPrice != null || state.maxPrice != null) count += 1;
  if (state.sort !== 'relevance') count += 1;
  return count;
}

/** Empty browse state for a gender (used by reset and server prefetch). */
export function emptyShopBrowseState(
  gender: SuitableFor = 'female',
): ShopBrowseState {
  return { sort: 'relevance', gender, merchantIds: [], brands: [], colours: [] };
}

/** Toggle one value in a multi-select list. */
export function toggleListValue(list: readonly string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((entry) => entry !== value)
    : [...list, value];
}

/**
 * Brand toggle. The catalog matches brands case-insensitively, so a URL value
 * of "ADIDAS" and the facet label "adidas" are the same selection: clicking it
 * must untick it, not add a second spelling.
 */
export function toggleBrandValue(list: readonly string[], value: string): string[] {
  const key = value.toLowerCase();
  return list.some((entry) => entry.toLowerCase() === key)
    ? list.filter((entry) => entry.toLowerCase() !== key)
    : [...list, value];
}

/** Keep the first spelling of each brand (`merke=adidas&merke=ADIDAS` → one). */
function dedupeCaseInsensitive(values: readonly string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
