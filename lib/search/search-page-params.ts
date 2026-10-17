import type { SearchAudienceHint, SearchParams } from '@/lib/api/search';
import type { ShopCategory } from '@/lib/constants/shop-categories';
import {
  buildShopBrowseQuery,
  emptyShopBrowseState,
  parseShopBrowseState,
  type ShopBrowseState,
} from '@/lib/shop/shop-browse-params';
import { SEARCH_AUDIENCE_PARAM, SEARCH_QUERY_PARAM } from '@/lib/search/search-routing';

/**
 * The results page reuses the Shop's filter URL params (butikk, merke, farge,
 * min, max, salg, sort) so links and the filter drawer behave the same.
 * This stand-in category only enables those filters; it is never shown.
 */
const SEARCH_FILTER_SCOPE: ShopCategory = {
  slug: 'sok',
  label: 'Søk',
  description: '',
  ontologyId: 'apparel',
  gendered: false,
  children: [],
};

export interface SearchPageState {
  q: string;
  audienceHint?: SearchAudienceHint;
  filters: ShopBrowseState;
}

export function parseSearchPageState(params: URLSearchParams): SearchPageState {
  const hint = params.get(SEARCH_AUDIENCE_PARAM);
  return {
    q: (params.get(SEARCH_QUERY_PARAM) ?? '').trim().slice(0, 100),
    audienceHint: hint === 'herre' ? 'male' : hint === 'dame' ? 'female' : undefined,
    filters: { ...parseShopBrowseState(params, SEARCH_FILTER_SCOPE), sub: undefined, gender: 'female' },
  };
}

export function emptySearchFilters(): ShopBrowseState {
  return emptyShopBrowseState('female');
}

export function buildSearchPageQuery(state: SearchPageState): string {
  const params = new URLSearchParams();
  params.set(SEARCH_QUERY_PARAM, state.q);
  if (state.audienceHint) {
    params.set(SEARCH_AUDIENCE_PARAM, state.audienceHint === 'male' ? 'herre' : 'dame');
  }
  const filters = buildShopBrowseQuery({ ...state.filters, sub: undefined, gender: 'female' });
  return filters ? `${params.toString()}&${filters}` : params.toString();
}

/** API params; sorted lists keep the cache key stable. */
export function searchParamsFor(state: SearchPageState): SearchParams {
  const f = state.filters;
  return {
    q: state.q,
    audienceHint: state.audienceHint,
    merchantIds: f.merchantIds.length ? [...f.merchantIds].sort() : undefined,
    brandValues: f.brands.length ? [...f.brands].sort() : undefined,
    colourFamilies: f.colours.length ? [...f.colours].sort() : undefined,
    minPrice: f.minPrice,
    maxPrice: f.maxPrice,
    onSale: f.onSale ? true : undefined,
    sort: f.sort,
  };
}
