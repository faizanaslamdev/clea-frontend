import { HeroSearchPanel } from '@/components/hero-search-panel';
import { PageHero } from '@/components/page-hero';

const HERO_IMAGE = '/products/hero.jpg';

export function HeroSection() {
  return (
    <PageHero
      imageSrc={HERO_IMAGE}
      ariaLabel="Welcome"
      contentClassName="page-hero-content--home"
    >
      <div className="layout-inner-wide text-center">
        <h1 className="hero-kicker">Nordic fashion &amp; beauty</h1>
        <HeroSearchPanel />
      </div>
    </PageHero>
  );
}
