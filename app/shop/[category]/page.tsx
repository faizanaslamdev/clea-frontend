import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/page-layout';
import { ShopBrowseClient } from '@/components/shop/shop-browse-client';
import {
  fetchCatalogFacets,
  fetchCatalogFromApi,
  type CatalogPageResult,
} from '@/lib/api/products';
import { fetchAllStoresFromApi } from '@/lib/api/stores';
import { CATALOG_PAGE_SIZE } from '@/lib/constants/catalog';
import {
  findShopCategory,
  SHOP_CATEGORIES,
} from '@/lib/constants/shop-categories';
import { productKeys } from '@/lib/query/keys';
import { emptyShopBrowseState, shopBrowseFilters } from '@/lib/shop/shop-browse-params';
import { BRAND } from '@/lib/constants/brand';

export const revalidate = 120;

export function generateStaticParams(): Array<{ category: string }> {
  return SHOP_CATEGORIES.map((entry) => ({ category: entry.slug }));
}

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = findShopCategory(slug);

  if (!category) {
    return { title: 'Handle' };
  }

  return {
    title: category.label,
    description: `${category.description} Sammenlign priser på ${BRAND.domain}.`,
    alternates: { canonical: `/shop/${category.slug}` },
  };
}

export default async function ShopCategoryPage({ params }: PageProps) {
  const { category: slug } = await params;
  const category = findShopCategory(slug);

  if (!category) {
    notFound();
  }

  // The unfiltered Dame view is what most visitors land on, so prefetch exactly
  // that on the server. Any other filter combination hydrates and fetches
  // client-side, which is correct — those are refinements, not first paint.
  const defaultFilters = shopBrowseFilters(category, emptyShopBrowseState('female'));

  const queryClient = new QueryClient();

  const [stores] = await Promise.all([
    fetchAllStoresFromApi().catch(() => []),
    // Filter options + exact count for the default view, so the toolbar and
    // drawer are ready on first paint.
    queryClient
      .prefetchQuery({
        queryKey: productKeys.catalogFacets(defaultFilters),
        queryFn: () =>
          fetchCatalogFacets(defaultFilters, { next: { revalidate: 120 } }),
      })
      .catch(() => undefined),
    queryClient
      .prefetchInfiniteQuery({
        queryKey: productKeys.catalog(defaultFilters),
        queryFn: () =>
          fetchCatalogFromApi(
            {
              ...defaultFilters,
              limit: CATALOG_PAGE_SIZE,
              offset: 0,
            },
            { next: { revalidate: 120 } },
          ),
        initialPageParam: 0,
        getNextPageParam: (lastPage: CatalogPageResult) =>
          lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined,
      })
      .catch(() => undefined),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageLayout>
        <ShopBrowseClient category={category} stores={stores} />
      </PageLayout>
    </HydrationBoundary>
  );
}
