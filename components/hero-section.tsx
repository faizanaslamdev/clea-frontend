import { HeroSectionContent } from '@/components/hero-section-content';
import { PageHero } from '@/components/page-hero';

export function HeroSection() {
  return (
    <PageHero ariaLabel="Velkommen" contentClassName="page-hero-content--home">
      <HeroSectionContent />
    </PageHero>
  );
}
