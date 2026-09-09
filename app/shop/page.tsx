import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/page-layout';
import { ShopPageClient } from '@/components/shop/shop-page-client';
import {
  fetchCategoryPreviews,
  fetchTrendingLooks,
} from '@/lib/api/products';
import { categoryGridForShop } from '@/lib/constants/category-grid';
import { productKeys } from '@/lib/query/keys';
import type { SuitableFor } from '@/lib/api/chat-types';

/** Keep shop previews fresh without a full client waterfall on every visit. */
export const revalidate = 120;

const SHOP_AUDIENCES: readonly SuitableFor[] = ['female', 'male'];

/** Prefetch Dame + Herre together so gender toggle is cache-hit instant. */
async function prefetchShopData() {
  const queryClient = new QueryClient();

  await Promise.all(
    SHOP_AUDIENCES.flatMap((suitableFor) => {
      const entries = categoryGridForShop(suitableFor);
      return [
        queryClient.prefetchQuery({
          queryKey: productKeys.categoryGrid(suitableFor),
          queryFn: () => fetchCategoryPreviews(entries, suitableFor),
        }),
        queryClient.prefetchQuery({
          queryKey: productKeys.trending(suitableFor),
          queryFn: () => fetchTrendingLooks(suitableFor, 3),
        }),
      ];
    }),
  );

  return dehydrate(queryClient);
}

export default async function ShopPage() {
  const state = await prefetchShopData();

  return (
    <HydrationBoundary state={state}>
      <PageLayout>
        <ShopPageClient />
      </PageLayout>
    </HydrationBoundary>
  );
}
