import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { HeroSection } from '@/components/hero-section';
import { PageLayout } from '@/components/layout/page-layout';
import { FavoriteFindsSection } from '@/components/favorite-finds-section';
import { ShopEverywhereSection } from '@/components/shop-everywhere-section';
import PartnerSection from '@/components/partner-section';
import { BrandMarquee } from '@/components/brands/brand-marquee';
import { TrendingSection } from '@/components/trending-section';
import { SearchBySection } from '@/components/search-by-section';
import { CategorySection } from '@/components/category-section';
import { FeatureTabsSection } from '@/components/feature-tabs-section';
import { Reveal } from '@/components/shared/reveal';
import { fetchCategoryPreviews, fetchFeaturedProducts } from '@/lib/api/products';
import { fetchAllStores } from '@/lib/api/stores';
import { CATEGORY_GRID_ENTRIES } from '@/lib/constants/category-grid';
import { POPULAR_PRODUCTS_LIMIT } from '@/lib/constants/popular-brands';
import { productKeys, storeKeys } from '@/lib/query/keys';

/** Keep home data fresh without forcing a full client waterfall on every visit. */
export const revalidate = 120;

async function prefetchHomeData() {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: productKeys.featured(),
      queryFn: () => fetchFeaturedProducts(POPULAR_PRODUCTS_LIMIT),
    }),
    queryClient.prefetchQuery({
      queryKey: productKeys.categoryGrid(),
      queryFn: () => fetchCategoryPreviews(CATEGORY_GRID_ENTRIES),
    }),
    // So the brand marquee hydrates with names (no late pop-in / gap jump).
    queryClient.prefetchQuery({
      queryKey: storeKeys.all,
      queryFn: fetchAllStores,
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
        <BrandMarquee />
        <Reveal>
          <CategorySection />
        </Reveal>
        <Reveal>
          <FeatureTabsSection />
        </Reveal>
        <Reveal>
          <TrendingSection />
        </Reveal>
        <Reveal>
          <SearchBySection />
        </Reveal>
        <Reveal>
          <PartnerSection />
        </Reveal>
        <Reveal>
          <FavoriteFindsSection />
        </Reveal>
        <Reveal>
          <ShopEverywhereSection />
        </Reveal>
      </PageLayout>
    </HydrationBoundary>
  );
}
