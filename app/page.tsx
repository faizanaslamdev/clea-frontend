import { HeroSection } from '@/components/hero-section';
import { PageLayout } from '@/components/layout/page-layout';
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
    </PageLayout>
  );
}
