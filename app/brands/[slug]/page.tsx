import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { notFound, redirect } from 'next/navigation';
import { PageLayout } from '@/components/layout/page-layout';
import { BrandHero } from '@/components/brands/brand-hero';
import { BrandProductSection } from '@/components/brands/brand-product-section';
import {
  fetchCatalogFromApi,
  type CatalogPageResult,
} from '@/lib/api/products';
import { CATALOG_PAGE_SIZE } from '@/lib/constants/catalog';
import { productKeys, type CatalogQueryFilters } from '@/lib/query/keys';
import {
  getBrandHref,
  getBrandSlug,
  resolveStoreFromRouteParam,
} from '@/lib/services';

/* Was `dynamic = 'force-dynamic'`, which opts the whole route out of Next's
   fetch cache -- so every visit re-hit the backend for the merchant lookup as
   well as the products. Reading searchParams already makes this route render
   dynamically; dropping the flag just lets the per-fetch `revalidate` windows
   below actually apply. */

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ m?: string | string[] }>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function BrandPage({
  params,
  searchParams,
}: BrandPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const merchantId = firstParam(query.m);
  const brand = await resolveStoreFromRouteParam(slug, merchantId);

  if (!brand) {
    notFound();
  }

  const canonicalSlug = getBrandSlug(brand);
  if (slug !== canonicalSlug) {
    redirect(getBrandHref(brand));
  }

  /* The grid used to start its first request only after the HTML shipped and
     hydration finished -- a full round-trip of empty skeleton after paint.
     Prefetching here puts page one in the payload, so it renders with the
     hero. Key/params must match useCatalogInfinite exactly or the client
     refetches and the work is wasted. */
  const filters: CatalogQueryFilters = {
    merchantId: brand.id,
    segment: 'all',
  };
  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: productKeys.catalog(filters),
    queryFn: () =>
      fetchCatalogFromApi(
        { ...filters, limit: CATALOG_PAGE_SIZE, offset: 0 },
        { next: { revalidate: 120 } },
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage: CatalogPageResult) =>
      lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined,
  });

  return (
    <PageLayout>
      <BrandHero brand={brand} />

      <section className="section-container section-shell">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <BrandProductSection
            merchantId={brand.id}
            brandName={brand.name}
          />
        </HydrationBoundary>
      </section>
    </PageLayout>
  );
}
