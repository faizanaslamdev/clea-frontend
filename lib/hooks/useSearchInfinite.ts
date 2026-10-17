'use client';

import { keepPreviousData, useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { fetchSearchPage, type SearchPageResult, type SearchParams } from '@/lib/api/search';
import { CATALOG_PAGE_SIZE } from '@/lib/constants/catalog';
import { productKeys } from '@/lib/query/keys';

/** Search results, paged; the first page carries facets and what was understood. */
export function useSearchInfinite(params: SearchParams, enabled = true) {
  const queryKey = productKeys.search(params);
  return useInfiniteQuery<
    SearchPageResult,
    Error,
    InfiniteData<SearchPageResult, number>,
    typeof queryKey,
    number
  >({
    queryKey,
    queryFn: ({ pageParam }) => fetchSearchPage({ ...params, limit: CATALOG_PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.hasMore ? last.offset + last.limit : undefined),
    enabled: enabled && params.q.trim().length > 0,
    // A filter change keeps the previous results on screen until the new ones land.
    placeholderData: keepPreviousData,
    staleTime: 2 * 60_000,
  });
}
