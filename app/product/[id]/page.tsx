import type { Metadata } from 'next';
import { cache } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { PageLayout } from '@/components/layout/page-layout';
import { ProductDetailView } from '@/components/product/product-detail-view';
import {
  fetchProductById,
  fetchProductOffers,
  fetchSimilarProducts,
} from '@/lib/api/products';
import { BRAND } from '@/lib/constants/brand';
import { STALE_TIME_STATIC_MS } from '@/lib/query/client';
import { productKeys } from '@/lib/query/keys';
import { getProductHref, isProductId } from '@/lib/domain/products/paths';
import { toDisplayCase } from '@/lib/services';

interface ProductPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ store?: string | string[] }>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

const loadProduct = cache(async (id: string) =>
  fetchProductById(id, { next: { revalidate: 120 } }),
);

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!isProductId(id)) {
    return { title: 'Produkt' };
  }

  const product = await loadProduct(id);

  if (!product) {
    return { title: 'Produkt ikke funnet' };
  }

  const title = `${product.brand} ${toDisplayCase(product.name)}`;
  const description =
    product.description?.trim().slice(0, 160) ||
    `Se pris og tilbud på ${title} hos ${BRAND.name}.`;
  const canonical = getProductHref(id);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: product.image
        ? [{ url: product.image, alt: toDisplayCase(product.name) }]
        : undefined,
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const storeId = firstParam(query.store);

  if (!isProductId(id)) {
    notFound();
  }

  const product = await loadProduct(id);
  if (!product) {
    notFound();
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: STALE_TIME_STATIC_MS },
    },
  });

  queryClient.setQueryData(productKeys.detail(id), product);

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: productKeys.similar(id),
      queryFn: () => fetchSimilarProducts(id, 4, { next: { revalidate: 120 } }),
    }),
    queryClient.prefetchQuery({
      queryKey: productKeys.offers(id),
      queryFn: () => fetchProductOffers(id, { next: { revalidate: 120 } }),
    }),
  ]);

  return (
    <PageLayout showFooter={false}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductDetailView productId={id} storeId={storeId} />
      </HydrationBoundary>
    </PageLayout>
  );
}
