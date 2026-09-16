import type { ProductFamily, SuitableFor } from '@/lib/api/chat-types';
import type { CatalogSort } from '@/lib/api/catalog-sort';

export type CatalogQueryFilters = {
  merchantId?: string;
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
