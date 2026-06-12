'use client';

import { HeroSearchForm } from '@/components/hero-search-form';
import { SearchSuggestionChips } from '@/components/search/search-suggestion-chips';
import { BRAND } from '@/lib/constants/brand';
import { useLandingSuggestions } from '@/lib/hooks/useLandingSuggestions';

export function HeroSectionContent() {
  const { shopCategory, setShopCategory, suggestions, selectSuggestion } =
    useLandingSuggestions();

  return (
    <div className="layout-inner-wide text-center">
      <h1 className="hero-kicker">
        {BRAND.heroTagline.map((line) => (
          <span key={line} className="hero-kicker__line">
            {line}
          </span>
        ))}
      </h1>
      <HeroSearchForm
        variant="full"
        appearance="floating"
        idPrefix="home-hero"
        shopCategory={shopCategory}
        onShopCategoryChange={setShopCategory}
      />
      <div className="hero-section__suggestions">
        <SearchSuggestionChips
          suggestions={suggestions}
          onSelect={selectSuggestion}
        />
      </div>
    </div>
  );
}
