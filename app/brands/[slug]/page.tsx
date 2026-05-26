import { notFound, redirect } from 'next/navigation';
import { PageLayout } from '@/components/layout/page-layout';
import { BrandHero } from '@/components/brands/brand-hero';
import { ProductGrid } from '@/components/product-grid';
import {
  getAllStores,
  getBrandSlug,
  getProductsByStoreId,
  resolveStoreFromRouteParam,
} from '@/lib/services';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = resolveStoreFromRouteParam(slug);

  if (!brand) {
    notFound();
  }

  const canonicalSlug = getBrandSlug(brand);
  if (slug !== canonicalSlug) {
    redirect(`/brands/${canonicalSlug}`);
  }

  const products = getProductsByStoreId(brand.id);

  return (
    <PageLayout>
      <BrandHero brand={brand} />

      <section className="section-container section-shell">
        <div className="mb-10">
          <h1 className="type-heading">{brand.name}</h1>
          <p className="type-subheading mt-2">
            {products.length} products available at {brand.name}
          </p>
        </div>

        <ProductGrid
          products={products}
          storeId={brand.id}
          emptyMessage={`No products listed for ${brand.name} yet.`}
        />
      </section>
    </PageLayout>
  );
}

export function generateStaticParams() {
  return getAllStores().map((store) => ({ slug: getBrandSlug(store) }));
}
