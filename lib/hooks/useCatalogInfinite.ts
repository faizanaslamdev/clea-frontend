'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import {
  fetchCatalogFromApi,
  type FetchProductsParams,
} from '@/lib/api/products';
import { CATALOG_PAGE_SIZE } from '@/lib/constants/catalog';
import { productKeys, type CatalogQueryFilters } from '@/lib/query/keys';

export function useCatalogInfinite(filters: CatalogQueryFilters) {
  const queryFilters: FetchProductsParams = {
    merchantId: filters.merchantId,
    brand: filters.brand,
    category: filters.category,
    q: filters.q,
    segment: filters.segment,
  };

  return useInfiniteQuery({
    queryKey: productKeys.catalog(filters),
    queryFn: ({ pageParam }) =>
      fetchCatalogFromApi({
        ...queryFilters,
        limit: CATALOG_PAGE_SIZE,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined,
  });
}
