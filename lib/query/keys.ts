export type CatalogQueryFilters = {
  merchantId?: string;
  brand?: string;
  category?: string;
  q?: string;
  segment?: 'fashion' | 'all';
};

import { POPULAR_PRODUCTS_MERCHANT_ID } from '@/lib/constants/featured';

export const productKeys = {
  all: ['products'] as const,
  featured: () =>
    [...productKeys.all, 'featured', POPULAR_PRODUCTS_MERCHANT_ID] as const,
  trending: () =>
    [...productKeys.all, 'trending', POPULAR_PRODUCTS_MERCHANT_ID] as const,
  catalog: (filters: CatalogQueryFilters) =>
    [...productKeys.all, 'catalog', filters] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
  search: (query: string) => [...productKeys.all, 'search', query] as const,
  similar: (id: string) => [...productKeys.all, 'similar', id] as const,
  comparison: (id: string) => [...productKeys.all, 'comparison', id] as const,
  chart: (id: string, days: number) =>
    [...productKeys.all, 'chart', id, days] as const,
};

export const storeKeys = {
  all: ['stores'] as const,
  featured: () => [...storeKeys.all, 'featured'] as const,
};
