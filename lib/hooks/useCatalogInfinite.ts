'use client';

import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
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
    // Changing a filter must not empty the grid first. Keep the previous
    // results on screen (blurred) until the new ones land, so the page never
    // collapses to a skeleton between two populated states.
    placeholderData: keepPreviousData,
  });
}
