import type { Metadata } from 'next';
import { PageLayout } from '@/components/layout/page-layout';
import { SearchResultsClient } from '@/components/search/search-results-client';
import { fetchAllStoresFromApi } from '@/lib/api/stores';

// Results are per query and fetched client-side (cached at the API edge);
// the shell is static apart from the store directory used for names.
export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Søk',
  description: 'Søk i produkter fra alle partnerbutikkene, med priser sammenlignet.',
  // Search results are not landing pages.
  robots: { index: false, follow: true },
};

export default async function SearchPage() {
  const stores = await fetchAllStoresFromApi().catch(() => []);
  return (
    <PageLayout>
      <SearchResultsClient stores={stores} />
    </PageLayout>
  );
}
