export const productKeys = {
  all: ['products'] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  trending: () => [...productKeys.all, 'trending'] as const,
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
