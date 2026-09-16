'use client';

import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import {
  fetchCatalogFromApi,
  type CatalogPageResult,
  type FetchProductsParams,
} from '@/lib/api/products';
import { CATALOG_PAGE_SIZE } from '@/lib/constants/catalog';
import { productKeys, type CatalogQueryFilters } from '@/lib/query/keys';

export function useCatalogInfinite(filters: CatalogQueryFilters) {
  const queryClient = useQueryClient();
  const queryKey = productKeys.catalog(filters);
  const cached =
    queryClient.getQueryData<InfiniteData<CatalogPageResult, number>>(queryKey);

  const queryFilters: FetchProductsParams = {
    merchantId: filters.merchantId,
    brand: filters.brand,
    category: filters.category,
    q: filters.q,
    segment: filters.segment,
    productFamily: filters.productFamily,
    suitableFor: filters.suitableFor,
    balanceMerchants: filters.balanceMerchants,
    ontologyCategoryIds: filters.ontologyCategoryIds,
    brandValues: filters.brandValues,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    colour: filters.colour,
    colourFieldOnly: filters.colourFieldOnly,
    onSale: filters.onSale,
    sort: filters.sort,
  };

  return useInfiniteQuery<
    CatalogPageResult,
    Error,
    InfiniteData<CatalogPageResult, number>,
    typeof queryKey,
    number
  >({
    queryKey,
    queryFn: ({ pageParam }) =>
      fetchCatalogFromApi({
        ...queryFilters,
        limit: CATALOG_PAGE_SIZE,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined,
    // Hub ready-navigation prefetches into this client cache; seed the first
    // paint so we never flash an empty skeleton when that data is already warm.
    ...(cached
      ? {
          initialData: cached,
          initialDataUpdatedAt: queryClient.getQueryState(queryKey)?.dataUpdatedAt,
        }
      : {}),
    // Changing a filter must not empty the grid first. Keep the previous
    // results on screen (blurred) until the new ones land.
    placeholderData: keepPreviousData,
  });
}
