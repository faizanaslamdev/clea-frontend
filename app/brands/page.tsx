'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageLayout } from '@/components/layout/page-layout';
import BrandGrid from '@/components/brands/BrandGrid';
import { PageSearchSection } from '@/components/shared/page-search-section';
import { useAllStores } from '@/lib/hooks/useStores';
import { searchStores } from '@/lib/services';

function BrandsPageContent() {
  const searchParams = useSearchParams();
  const brandQuery = searchParams.get('q')?.trim() ?? '';
  const { data: brands = [] } = useAllStores();

  const filteredBrands = useMemo(
    () => searchStores(brandQuery, brands),
    [brandQuery, brands],
  );

  return (
    <div className="section-container section-shell">
      <PageSearchSection
        title="Utforsk merker"
        placeholder="Søk etter et merke"
        paramKey="q"
        aria-label="Søk etter et merke"
      />

      {brandQuery && filteredBrands.length === 0 ? (
        <p className="text-center text-muted-foreground">
          Ingen merker funnet for «{brandQuery}»
        </p>
      ) : (
        <BrandGrid brands={filteredBrands} />
      )}
    </div>
  );
}

export default function BrandsPage() {
  return (
    <PageLayout>
      <Suspense fallback={null}>
        <BrandsPageContent />
      </Suspense>
    </PageLayout>
  );
}
