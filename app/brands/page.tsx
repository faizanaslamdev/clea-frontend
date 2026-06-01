'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageLayout } from '@/components/layout/page-layout';
import BrandGrid from '@/components/brands/BrandGrid';
import { PageSearchSection } from '@/components/shared/page-search-section';
import { LoadingBlock } from '@/components/shared/loading-block';
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

function BrandsPageFallback() {
  return (
    <div className="section-container section-shell">
      <LoadingBlock className="mb-12 h-32" />
      <div className="brand-grid">
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="brand-column">
            {Array.from({ length: 2 }).map((__, row) => (
              <LoadingBlock
                key={row}
                className="h-[260px] w-full rounded-xl md:h-[322px]"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BrandsPage() {
  return (
    <PageLayout>
      <Suspense fallback={<BrandsPageFallback />}>
        <BrandsPageContent />
      </Suspense>
    </PageLayout>
  );
}
