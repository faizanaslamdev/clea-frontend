import { notFound, redirect } from 'next/navigation';
import { ProductPageClient } from '@/components/product-page-client';
import { PageLayout } from '@/components/layout/page-layout';
import {
  getAllStores,
  getBrandSlug,
  getProductById,
  getProductHref,
  getProductsByStoreId,
  resolveStoreFromRouteParam,
} from '@/lib/services';

interface BrandProductPageProps {
  params: Promise<{ slug: string; productId: string }>;
}

export default async function BrandProductPage({ params }: BrandProductPageProps) {
  const { slug, productId } = await params;
  const brand = resolveStoreFromRouteParam(slug);
  const product = getProductById(productId);

  if (!brand || !product) {
    notFound();
  }

  const canonicalSlug = getBrandSlug(brand);
  if (slug !== canonicalSlug) {
    redirect(`/brands/${canonicalSlug}/products/${productId}`);
  }

  const listedAtBrand =
    product.prices[brand.id] != null && product.inStock[brand.id] !== false;

  if (!listedAtBrand) {
    redirect(getProductHref(productId, brand.id));
  }

  return (
    <PageLayout>
      <ProductPageClient product={product} storeId={brand.id} />
    </PageLayout>
  );
}

export function generateStaticParams() {
  const params: { slug: string; productId: string }[] = [];

  for (const store of getAllStores()) {
    const slug = getBrandSlug(store);
    for (const product of getProductsByStoreId(store.id)) {
      params.push({ slug, productId: product.id });
    }
  }

  return params;
}
