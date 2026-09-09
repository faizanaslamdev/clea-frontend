import type { ProductFamily } from '@/lib/api/chat-types';

export type CatalogQueryFilters = {
  merchantId?: string;
  brand?: string;
  category?: string;
  q?: string;
  segment?: 'fashion' | 'all';
  productFamily?: ProductFamily;
  balanceMerchants?: boolean;
};

export const productKeys = {
  all: ['products'] as const,
  featured: () => [...productKeys.all, 'featured', 'popular-now'] as const,
  categoryGrid: () => [...productKeys.all, 'category-grid'] as const,
  catalog: (filters: CatalogQueryFilters) =>
    [...productKeys.all, 'catalog', filters] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
  similar: (id: string) => [...productKeys.all, 'similar', id] as const,
  offers: (id: string) => [...productKeys.all, 'offers', id] as const,
};

export const storeKeys = {
  all: ['stores'] as const,
  featured: () => [...storeKeys.all, 'featured'] as const,
};
