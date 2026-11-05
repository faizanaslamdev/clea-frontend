'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import BrandGrid from '@/components/brands/BrandGrid';
import { BrandGridSkeleton } from '@/components/brands/brand-grid-skeleton';
import { PageSearchSection } from '@/components/shared/page-search-section';
import { useAllStores } from '@/lib/hooks/useStores';
import { searchStores } from '@/lib/services';

/**
 * `query` is the URL's search string; the server render and Suspense fallback
 * pass "" so the first HTML already lists every store for crawlers without JS.
 */
function BrandsPageContent({ query }: { query: string }) {
  const brandQuery = new URLSearchParams(query).get('q')?.trim() ?? '';
  const { data: brands = [], isLoading, isError } = useAllStores();

  const filteredBrands = useMemo(
    () => searchStores(brandQuery, brands),
    [brandQuery, brands],
  );

  return (
    <div className="section-container section-shell">
      {/* The search box reads the URL itself; until then show the same heading. */}
      <Suspense
        fallback={
          <section className="page-search-section">
            <header className="page-search-section__header">
              <h1 className="type-heading">Utforsk merker</h1>
              <p className="type-subheading mt-2 max-w-2xl">
                Oppdag et kuratert utvalg av mote, tilbehør og nordiske favoritter.
              </p>
            </header>
          </section>
        }
      >
        <PageSearchSection
          title="Utforsk merker"
          description="Oppdag et kuratert utvalg av mote, tilbehør og nordiske favoritter."
          placeholder="Søk etter et merke"
          paramKey="q"
          aria-label="Søk etter et merke"
        />
      </Suspense>

      {isLoading ? (
        <>
          <p className="sr-only">Laster merker</p>
          <BrandGridSkeleton />
        </>
      ) : isError ? (
        /* Without this the page just ended after the search box -- no grid,
           no skeleton, no explanation. /shop and the brand detail pages both
           say this in the same situation. */
        <p className="text-center text-muted-foreground">
          Kunne ikke laste merker. Prøv igjen senere.
        </p>
      ) : filteredBrands.length === 0 ? (
        <p className="text-center text-muted-foreground">
          {brandQuery
            ? `Ingen merker funnet for «${brandQuery}»`
            : 'Ingen merker tilgjengelig akkurat nå'}
        </p>
      ) : (
        <BrandGrid brands={filteredBrands} />
      )}
    </div>
  );
}

function BrandsPageFromUrl() {
  const searchParams = useSearchParams();
  return <BrandsPageContent query={searchParams.toString()} />;
}

export function BrandsPageClient() {
  return (
    <Suspense fallback={<BrandsPageContent query="" />}>
      <BrandsPageFromUrl />
    </Suspense>
  );
}
