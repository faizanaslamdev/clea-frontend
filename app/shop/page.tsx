import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/page-layout';
import { ShopPageClient } from '@/components/shop/shop-page-client';
import {
  fetchCategoryPreviews,
  fetchTrendingLooks,
} from '@/lib/api/products';
import { categoryGridForShop } from '@/lib/constants/category-grid';
import { productKeys } from '@/lib/query/keys';
import { parseShopGenderParam } from '@/lib/shop/shop-gender';
import type { SuitableFor } from '@/lib/api/chat-types';

/** Keep shop previews fresh without a full client waterfall on every visit. */
export const revalidate = 120;

async function prefetchShopData(suitableFor: SuitableFor) {
  const queryClient = new QueryClient();
  const entries = categoryGridForShop(suitableFor);

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: productKeys.categoryGrid(suitableFor),
      queryFn: () => fetchCategoryPreviews(entries, suitableFor),
    }),
    queryClient.prefetchQuery({
      queryKey: productKeys.trending(suitableFor),
      queryFn: () => fetchTrendingLooks(suitableFor, 3),
    }),
  ]);

  return dehydrate(queryClient);
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ gender?: string | string[] }>;
}) {
  const params = await searchParams;
  const genderRaw = Array.isArray(params.gender)
    ? params.gender[0]
    : params.gender;
  const suitableFor = parseShopGenderParam(genderRaw ?? null);
  const state = await prefetchShopData(suitableFor);

  return (
    <HydrationBoundary state={state}>
      <PageLayout>
        <ShopPageClient />
      </PageLayout>
    </HydrationBoundary>
  );
}
