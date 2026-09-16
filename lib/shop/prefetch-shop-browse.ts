import {
  fetchCatalogFromApi,
  type CatalogPageResult,
} from '@/lib/api/products';
import { CATALOG_PAGE_SIZE } from '@/lib/constants/catalog';
import { findShopCategory } from '@/lib/constants/shop-categories';
import { productKeys, type CatalogQueryFilters } from '@/lib/query/keys';
import {
  parseShopBrowseState,
  shopBrowseFilters,
} from '@/lib/shop/shop-browse-params';
import type { QueryClient } from '@tanstack/react-query';

/**
 * Resolve the catalog filters a Shop browse URL will request on first paint.
 * Returns null for non-browse hrefs.
 */
export function catalogFiltersForShopHref(
  href: string,
): CatalogQueryFilters | null {
  let url: URL;
  try {
    url = new URL(href, 'http://clea.local');
  } catch {
    return null;
  }

  const match = url.pathname.match(/^\/shop\/([^/]+)\/?$/);
  if (!match) return null;

  const category = findShopCategory(match[1]);
  if (!category) return null;

  const state = parseShopBrowseState(url.searchParams, category);
  return shopBrowseFilters(category, state);
}

/**
 * Prefetch the first catalog page for a Shop browse href into React Query.
 * Resolves when the critical first-page payload is in cache (not images).
 */
export async function prefetchShopBrowseCatalog(
  queryClient: QueryClient,
  href: string,
): Promise<void> {
  const filters = catalogFiltersForShopHref(href);
  if (!filters) return;

  await queryClient.prefetchInfiniteQuery({
    queryKey: productKeys.catalog(filters),
    queryFn: ({ pageParam }) =>
      fetchCatalogFromApi({
        ...filters,
        limit: CATALOG_PAGE_SIZE,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: CatalogPageResult) =>
      lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined,
  });
}
