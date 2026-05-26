import { HeroSearchForm } from '@/components/hero-search-form';
import { PageHero } from '@/components/page-hero';
import { BRAND } from '@/lib/constants/brand';

const HERO_IMAGE = '/products/hero.jpg';

export function HeroSection() {
  return (
    <PageHero
      imageSrc={HERO_IMAGE}
      ariaLabel="Welcome"
      contentClassName="page-hero-content--home"
    >
      <div className="layout-inner-wide text-center">
        <h1 className="hero-kicker">{BRAND.tagline}</h1>
        <HeroSearchForm variant="full" />
      </div>
    </PageHero>
  );
}
