import { apiFetch } from '@/lib/api/backend-client';
import type { CatalogSort } from '@/lib/api/catalog-sort';
import { mapApiProductToProduct } from '@/lib/api/mappers';
import type { CatalogFacets } from '@/lib/api/products';
import type { ApiProduct } from '@/lib/api/types';
import { CATALOG_PAGE_SIZE } from '@/lib/constants/catalog';
import type { Product } from '@/lib/types';

/** Soft Dame/Herre preference from the toggle next to the search box. */
export type SearchAudienceHint = 'female' | 'male';

export interface SearchParams {
  q: string;
  audienceHint?: SearchAudienceHint;
  merchantIds?: string[];
  brandValues?: string[];
  colourFamilies?: string[];
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  sort?: CatalogSort;
}

/** What the engine read from the query, so the page can say so. */
export interface SearchUnderstanding {
  categoryIds: string[];
  /** The words that named the category ("jeans", "vinterjakke"). */
  categoryTerms: string[];
  audience: 'female' | 'male' | 'kids' | null;
  colourFamilies: string[];
  brands: string[];
  brandLabels: string[];
  merchantIds: string[];
  minPrice: number | null;
  maxPrice: number | null;
  onSale: boolean;
  textWords: string[];
}

/** A constraint dropped because nothing matched all of them. */
export type SearchRelaxation = 'words' | 'words_ranked' | 'colour' | 'audience' | 'brand';

interface ApiSearchResponse {
  items: ApiProduct[];
  total: number;
  hasMore: boolean;
  limit: number;
  offset: number;
  understood: SearchUnderstanding;
  requested: SearchUnderstanding;
  broadenedCategoryIds: string[];
  includedUnlabelledAudience: boolean;
  relaxed: SearchRelaxation[];
  facets?: CatalogFacets;
  tookMs: number;
}

export interface SearchPageResult {
  products: Product[];
  total: number;
  hasMore: boolean;
  limit: number;
  offset: number;
  understood: SearchUnderstanding;
  /** Before relaxation — what the shopper asked for. */
  requested: SearchUnderstanding;
  includedUnlabelledAudience: boolean;
  relaxed: SearchRelaxation[];
  facets?: CatalogFacets;
}

export function buildSearchApiQuery(params: SearchParams & { limit?: number; offset?: number; facets?: boolean }): string {
  const search = new URLSearchParams();
  search.set('q', params.q.trim());
  if (params.audienceHint) search.set('audience_hint', params.audienceHint);
  if (params.merchantIds?.length) search.set('merchant_ids', params.merchantIds.join(','));
  if (params.brandValues?.length) search.set('brand_values', params.brandValues.join(','));
  if (params.colourFamilies?.length) search.set('colour_families', params.colourFamilies.join(','));
  if (params.minPrice != null) search.set('min_price', String(params.minPrice));
  if (params.maxPrice != null) search.set('max_price', String(params.maxPrice));
  if (params.onSale) search.set('on_sale', 'true');
  if (params.sort && params.sort !== 'relevance') search.set('sort', params.sort);
  search.set('limit', String(params.limit ?? CATALOG_PAGE_SIZE));
  search.set('offset', String(params.offset ?? 0));
  if (params.facets) search.set('facets', '1');
  return search.toString();
}

/** One page of `GET /search`; the first page also carries filter facets. */
export async function fetchSearchPage(
  params: SearchParams & { limit?: number; offset?: number },
  init?: RequestInit,
): Promise<SearchPageResult> {
  const offset = params.offset ?? 0;
  const data = await apiFetch<ApiSearchResponse>(
    `/search?${buildSearchApiQuery({ ...params, offset, facets: offset === 0 })}`,
    { ...(init ?? { cache: 'no-store' }) },
  );
  return {
    products: data.items.map(mapApiProductToProduct),
    total: data.total,
    hasMore: data.hasMore,
    limit: data.limit,
    offset: data.offset,
    understood: data.understood,
    requested: data.requested ?? data.understood,
    includedUnlabelledAudience: data.includedUnlabelledAudience,
    relaxed: data.relaxed,
    facets: data.facets,
  };
}
