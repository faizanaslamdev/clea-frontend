import { HeroSection } from '@/components/hero-section';
import { PageLayout } from '@/components/layout/page-layout';
import { FavoriteFindsSection } from '@/components/favorite-finds-section';
import { ShopEverywhereSection } from '@/components/shop-everywhere-section';
import PartnerSection from '@/components/partner-section';
import StoreSection from '@/components/stores/StoreSection';
import { TrendingSection } from '@/components/trending-section';

export default function Home() {
  return (
    <PageLayout>
      <HeroSection />
      <StoreSection />
      <TrendingSection />
      <PartnerSection />
      <FavoriteFindsSection />
      <ShopEverywhereSection />
    </PageLayout>
  );
}
