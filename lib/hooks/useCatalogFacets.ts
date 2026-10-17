'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchCatalogFacets, type CatalogFacets } from '@/lib/api/products';
import { productKeys, type CatalogQueryFilters } from '@/lib/query/keys';

/** Filter-drawer options + exact total for the current Shop filters. */
export function useCatalogFacets(filters: CatalogQueryFilters) {
  return useQuery<CatalogFacets>({
    queryKey: productKeys.catalogFacets(filters),
    queryFn: () => fetchCatalogFacets(filters),
    // Keep the old counts on screen while a new selection loads.
    placeholderData: keepPreviousData,
    // Same freshness as the product list: counts are hydrated from the ISR page
    // (up to a few minutes old) and must not refetch on every visit.
    staleTime: 5 * 60_000,
  });
}
