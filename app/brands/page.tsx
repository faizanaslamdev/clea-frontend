import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/page-layout';
import { BrandsPageClient } from '@/components/brands/brands-page-client';
import { fetchAllStores } from '@/lib/api/stores';
import { storeKeys } from '@/lib/query/keys';

export const revalidate = 900; // see LISTING_REVALIDATE_SECONDS

/** Stores are fetched on the server so the first HTML lists them all. */
export default async function BrandsPage() {
  const queryClient = new QueryClient();
  await queryClient
    .prefetchQuery({ queryKey: storeKeys.all, queryFn: fetchAllStores })
    .catch(() => undefined);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageLayout>
        <BrandsPageClient />
      </PageLayout>
    </HydrationBoundary>
  );
}
