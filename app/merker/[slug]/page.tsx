import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/page-layout';
import { BrandCatalogSection } from '@/components/merker/brand-catalog-section';
import {
  fetchCatalogFromApi,
  type CatalogPageResult,
  LISTING_REVALIDATE_SECONDS,
} from '@/lib/api/products';
import { CATALOG_PAGE_SIZE } from '@/lib/constants/catalog';
import { findProductBrand, getProductBrands } from '@/lib/domain/brands/product-brands';
import { productKeys, type CatalogQueryFilters } from '@/lib/query/keys';
import { breadcrumbJsonLd, JsonLd } from '@/lib/seo/json-ld';
import { socialMetadata } from '@/lib/seo/social';

export const revalidate = 900; // see LISTING_REVALIDATE_SECONDS

/** The biggest brands are built ahead; the rest render on first visit and are cached. */
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const brands = await getProductBrands().catch(() => []);
  return brands.slice(0, 60).map((brand) => ({ slug: brand.slug }));
}

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

function countText(count: number): string {
  return `${count.toLocaleString('nb-NO')} produkter`;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await findProductBrand(slug).catch(() => undefined);
  const canonical = `/merker/${slug}`;
  if (!brand) return { title: 'Merke', alternates: { canonical } };

  const title = `${brand.name} – sammenlign priser på ${countText(brand.productCount)} | Clea`;
  const description = `Finn ${brand.name} til laveste pris. Se ${countText(brand.productCount)} fra ${brand.name} hos flere nettbutikker i Norge, sammenlign prisene og få varsel når prisen faller.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    ...socialMetadata({ title, description, path: canonical }),
  };
}

export default async function ProductBrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = await findProductBrand(slug).catch(() => undefined);
  if (!brand) notFound();

  const filters: CatalogQueryFilters = { brand: brand.value, segment: 'all' };
  const queryClient = new QueryClient();
  await queryClient
    .prefetchInfiniteQuery({
      queryKey: productKeys.catalog(filters),
      queryFn: () =>
        fetchCatalogFromApi(
          { ...filters, limit: CATALOG_PAGE_SIZE, offset: 0 },
          { next: { revalidate: LISTING_REVALIDATE_SECONDS } },
        ),
      initialPageParam: 0,
      getNextPageParam: (lastPage: CatalogPageResult) =>
        lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined,
    })
    .catch(() => undefined);

  return (
    <PageLayout>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Clea', path: '/' },
          { name: 'Merker', path: '/merker' },
          { name: brand.name, path: `/merker/${brand.slug}` },
        ])}
      />
      <section className="section-container section-shell">
        <nav aria-label="Brødsmuler" className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Clea</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/merker" className="hover:text-foreground">Merker</Link>
          <span aria-hidden="true"> / </span>
          <span className="text-foreground">{brand.name}</span>
        </nav>

        <header className="mb-10 max-w-3xl">
          <h1 className="type-heading">{brand.name}</h1>
          <p className="type-subheading mt-3">
            {countText(brand.productCount)} fra {brand.name}, samlet fra flere nettbutikker. Se
            prisene side om side og kjøp der det er billigst.
          </p>
        </header>

        <HydrationBoundary state={dehydrate(queryClient)}>
          <BrandCatalogSection brand={brand.value} brandName={brand.name} />
        </HydrationBoundary>

        <div className="mt-16 max-w-3xl space-y-4 text-muted-foreground">
          <h2 className="type-subheading text-foreground">
            Slik finner du {brand.name} til best pris
          </h2>
          <p>
            Den samme {brand.name}-varen kan ha ulik pris hos forskjellige nettbutikker. Clea viser
            hvilke butikker som har varen, hva den koster hos hver av dem og om den er på lager, så
            du slipper å åpne mange faner.
          </p>
          <p>
            Åpne et produkt for å se alle tilbud og lignende produkter, eller slå på prisvarsel for å
            få beskjed når prisen faller. Leter du etter noe bestemt? Spør{' '}
            <Link href="/chat" className="underline underline-offset-4 hover:text-foreground">
              AI-moteassistenten
            </Link>
            , for eksempel «{brand.name} til under 1000 kr».
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
