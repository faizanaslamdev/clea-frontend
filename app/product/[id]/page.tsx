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
  LISTING_REVALIDATE_SECONDS,
} from '@/lib/api/products';
import { BRAND } from '@/lib/constants/brand';
import { STALE_TIME_STATIC_MS } from '@/lib/query/client';
import { productKeys } from '@/lib/query/keys';
import { prefetchWithin } from '@/lib/query/prefetch-within';
import { getProductHref, isProductId } from '@/lib/domain/products/paths';
import { toDisplayCase } from '@/lib/services';
import type { Product } from '@/lib/types';
import type { ProductOffersResult } from '@/lib/api/products';
import { JsonLd, productJsonLd } from '@/lib/seo/json-ld';

interface ProductPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ store?: string | string[] }>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/** Offers drive the price comparison, so they get the longer wait. */
const OFFERS_BUDGET_MS = 2000;
const SIMILAR_BUDGET_MS = 600;

const loadProduct = cache(async (id: string) =>
  fetchProductById(id, { next: { revalidate: 120 } }),
);

/** "adidas" + "Adidas Women's Ultraboost 5" should not read "adidas Adidas …". */
function productTitle(product: Product): string {
  const name = toDisplayCase(product.name);
  const brand = product.brand?.trim();
  if (!brand) return name;
  return name.toLowerCase().startsWith(brand.toLowerCase()) ? name : `${brand} ${name}`;
}

function productStructuredData(
  id: string,
  product: Product,
  offersResult: ProductOffersResult | undefined,
) {
  const fromOffers = offersResult?.offers?.length
    ? offersResult.offers
    : offersResult?.anchor
      ? [offersResult.anchor]
      : [];
  const offers = fromOffers.length
    ? fromOffers.map((offer) => ({
        price: offer.price,
        currency: offer.currency,
        inStock: offer.in_stock,
        storeName: offer.merchant_name,
      }))
    : [
        {
          price: product.lowestPrice,
          currency: product.currency ?? 'NOK',
          inStock: Object.values(product.inStock ?? {}).some(Boolean),
          storeName: product.merchantName,
        },
      ];
  return productJsonLd({
    url: `${BRAND.siteUrl}${getProductHref(id)}`,
    name: productTitle(product),
    brand: product.brand,
    description: product.description?.trim().slice(0, 500) || null,
    images: (product.images?.length ? product.images : [product.image]).filter(Boolean),
    sku: product.sku || null,
    colour: product.colour ?? null,
    offers,
  });
}

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

  const title = productTitle(product);
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

  // Only the product itself blocks the page. Offers and similar products get
  // a short budget: when the API answers in time they are rendered with the
  // page, otherwise the client fetches them behind their skeletons.
  await Promise.all([
    prefetchWithin(
      queryClient,
      {
        queryKey: productKeys.offers(id),
        queryFn: () => fetchProductOffers(id, { next: { revalidate: 120 } }),
      },
      OFFERS_BUDGET_MS,
    ),
    prefetchWithin(
      queryClient,
      {
        queryKey: productKeys.similar(id),
        queryFn: () =>
          fetchSimilarProducts(id, 4, {
            next: { revalidate: LISTING_REVALIDATE_SECONDS },
          }),
      },
      SIMILAR_BUDGET_MS,
    ),
  ]);

  const structuredData = productStructuredData(
    id,
    product,
    queryClient.getQueryData<ProductOffersResult>(productKeys.offers(id)),
  );

  return (
    <PageLayout showFooter={false}>
      {structuredData ? <JsonLd data={structuredData} /> : null}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductDetailView productId={id} storeId={storeId} />
      </HydrationBoundary>
    </PageLayout>
  );
}
