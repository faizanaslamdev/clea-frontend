import { notFound, redirect } from 'next/navigation';
import { PageLayout } from '@/components/layout/page-layout';
import { BrandHero } from '@/components/brands/brand-hero';
import { BrandProductSection } from '@/components/brands/brand-product-section';
import {
  getBrandSlug,
  resolveStoreFromRouteParam,
} from '@/lib/services';

export const dynamic = 'force-dynamic';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = await resolveStoreFromRouteParam(slug);

  if (!brand) {
    notFound();
  }

  const canonicalSlug = getBrandSlug(brand);
  if (slug !== canonicalSlug) {
    redirect(`/brands/${canonicalSlug}`);
  }

  return (
    <PageLayout>
      <BrandHero brand={brand} />

      <section className="section-container section-shell">
        <BrandProductSection
          merchantId={brand.id}
          brandName={brand.name}
        />
      </section>
    </PageLayout>
  );
}
