import { Suspense } from 'react';
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

/** Same skeleton BrandProductSection shows while its query is pending. */
function BrandProductsFallback() {
  return (
    <>
      <div className="mb-10 space-y-3">
        <div className="h-9 w-52 animate-pulse rounded bg-muted" />
        <div className="h-5 w-72 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="aspect-3/4 animate-pulse rounded-2xl bg-muted"
          />
        ))}
      </div>
    </>
  );
}

/**
 * Prefetch page-1 catalog on the server, then hydrate into useCatalogInfinite.
 * Isolated in Suspense so BrandHero can paint without waiting on /catalog.
 */
async function BrandProductsPrefetch({
  merchantId,
  brandName,
}: {
  merchantId: string;
  brandName: string;
}) {
  const filters: CatalogQueryFilters = {
    merchantId,
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
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BrandProductSection merchantId={merchantId} brandName={brandName} />
    </HydrationBoundary>
  );
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

  return (
    <PageLayout>
      <BrandHero brand={brand} />

      <section className="section-container section-shell">
        <Suspense fallback={<BrandProductsFallback />}>
          <BrandProductsPrefetch merchantId={brand.id} brandName={brand.name} />
        </Suspense>
      </section>
    </PageLayout>
  );
}
