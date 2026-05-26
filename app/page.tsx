import { HeroSection } from '@/components/hero-section';
import { PageLayout } from '@/components/layout/page-layout';
import { FavoriteFindsSection } from '@/components/favorite-finds-section';
import { ShopEverywhereSection } from '@/components/shop-everywhere-section';
import PartnerSection from '@/components/partner-section';
import BrandSection from '@/components/brands/BrandSection';
import { TrendingSection } from '@/components/trending-section';

export default function Home() {
  return (
    <PageLayout>
      <HeroSection />
      <BrandSection />
      <TrendingSection />
      <PartnerSection />
      <FavoriteFindsSection />
      <ShopEverywhereSection />
    </PageLayout>
  );
}
