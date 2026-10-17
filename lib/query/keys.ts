import type { ProductFamily, SuitableFor } from '@/lib/api/chat-types';
import type { CatalogSort } from '@/lib/api/catalog-sort';
import type { SearchParams } from '@/lib/api/search';

export type CatalogQueryFilters = {
  merchantId?: string;
  /** Shop multi-select stores. */
  merchantIds?: string[];
  brand?: string;
  category?: string;
  q?: string;
  segment?: 'fashion' | 'all';
  productFamily?: ProductFamily;
  suitableFor?: SuitableFor;
  balanceMerchants?: boolean;
  /** Ontology branch ids; the backend expands them to descendants. */
  ontologyCategoryIds?: string[];
  brandValues?: string[];
  minPrice?: number;
  maxPrice?: number;
  /** Canonical colour key; pairs with colourFieldOnly for Shop. */
  colour?: string;
  colourFieldOnly?: boolean;
  /** Shop multi-select stored colour families. */
  colourFamilies?: string[];
  onSale?: boolean;
  sort?: CatalogSort;
};

export const productKeys = {
  all: ['products'] as const,
  featured: () => [...productKeys.all, 'featured', 'popular-now'] as const,
  categoryGrid: (suitableFor?: SuitableFor) =>
    [...productKeys.all, 'category-grid', suitableFor ?? 'all'] as const,
  trending: (suitableFor?: SuitableFor) =>
    [...productKeys.all, 'trending', suitableFor ?? 'all'] as const,
  catalog: (filters: CatalogQueryFilters) =>
    [...productKeys.all, 'catalog', filters] as const,
  /** Filter-drawer facets: same filters as the listing, sort is irrelevant. */
  catalogFacets: (filters: CatalogQueryFilters) => {
    const { sort: _sort, ...rest } = filters;
    void _sort;
    return [...productKeys.all, 'catalog-facets', rest] as const;
  },
  /** Search results page (`GET /search`); page 0 also carries facets. */
  search: (params: SearchParams) => [...productKeys.all, 'search', params] as const,
  catalogBrands: (limit = 250) =>
    [...productKeys.all, 'catalog-brands', limit] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
  similar: (id: string) => [...productKeys.all, 'similar', id] as const,
  offers: (id: string) => [...productKeys.all, 'offers', id] as const,
};

export const storeKeys = {
  all: ['stores'] as const,
  featured: () => [...storeKeys.all, 'featured'] as const,
};
