import { HeroSectionContent } from '@/components/hero-section-content';
import { PageHero } from '@/components/page-hero';

const HERO_IMAGE = '/products/hero.jpg';

export function HeroSection() {
  return (
    <PageHero
      imageSrc={HERO_IMAGE}
      ariaLabel="Velkommen"
      contentClassName="page-hero-content--home"
    >
      <HeroSectionContent />
    </PageHero>
  );
}
