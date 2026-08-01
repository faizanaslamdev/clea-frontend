import { notFound, redirect } from 'next/navigation';
import { PageLayout } from '@/components/layout/page-layout';
import { BrandHero } from '@/components/brands/brand-hero';
import { BrandProductSection } from '@/components/brands/brand-product-section';
import {
  getBrandHref,
  getBrandSlug,
  resolveStoreFromRouteParam,
} from '@/lib/services';

export const dynamic = 'force-dynamic';

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
