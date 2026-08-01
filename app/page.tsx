import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { HeroSection } from '@/components/hero-section';
import { PageLayout } from '@/components/layout/page-layout';
import { FavoriteFindsSection } from '@/components/favorite-finds-section';
import { ShopEverywhereSection } from '@/components/shop-everywhere-section';
import PartnerSection from '@/components/partner-section';
import BrandSection from '@/components/brands/BrandSection';
import { TrendingSection } from '@/components/trending-section';
import { fetchFeaturedProducts } from '@/lib/api/products';
import { fetchFeaturedStores } from '@/lib/api/stores';
import { POPULAR_PRODUCTS_LIMIT } from '@/lib/constants/popular-brands';
import { productKeys, storeKeys } from '@/lib/query/keys';

/** Keep home data fresh without forcing a full client waterfall on every visit. */
export const revalidate = 120;

async function prefetchHomeData() {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: storeKeys.featured(),
      queryFn: fetchFeaturedStores,
    }),
    queryClient.prefetchQuery({
      queryKey: productKeys.featured(),
      queryFn: () => fetchFeaturedProducts(POPULAR_PRODUCTS_LIMIT),
    }),
  ]);

  return dehydrate(queryClient);
}

export default async function Home() {
  const state = await prefetchHomeData();

  return (
    <HydrationBoundary state={state}>
      <PageLayout>
        <HeroSection />
        <BrandSection />
        <TrendingSection />
        <PartnerSection />
        <FavoriteFindsSection />
        <ShopEverywhereSection />
      </PageLayout>
    </HydrationBoundary>
  );
}
