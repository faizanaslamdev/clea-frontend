'use client';

import { HeroSearchForm } from '@/components/hero-search-form';
import { SearchSuggestionChips } from '@/components/search/search-suggestion-chips';
import { BRAND } from '@/lib/constants/brand';
import { placeholderExamplesFor } from '@/lib/constants/search-prompts';
import { useEffect } from 'react';
import { useLandingSuggestions } from '@/lib/hooks/useLandingSuggestions';
import { setHomeAudience } from '@/lib/home-audience';

export function HeroSectionContent() {
  const { shopCategory, setShopCategory, suggestions, isLoadingSuggestions, selectSuggestion } =
    useLandingSuggestions();
  // The sections below the hero follow the same Dame/Herre choice.
  useEffect(() => {
    setHomeAudience(shopCategory);
  }, [shopCategory]);

  return (
    <div className="layout-inner-wide text-center">
      <h1 className="hero-kicker">
        {BRAND.heroTagline.map((line) => (
          <span key={line} className="hero-kicker__line">
            {line}
          </span>
        ))}
      </h1>
      <div className="hero-search-glow">
        <HeroSearchForm
          variant="full"
          appearance="floating"
          idPrefix="home-hero"
          shopCategory={shopCategory}
          onShopCategoryChange={setShopCategory}
          animatedPlaceholderPhrases={placeholderExamplesFor(shopCategory)}
          photoSearch
        />
      </div>
      <div className="hero-section__suggestions">
        <SearchSuggestionChips
          suggestions={suggestions}
          isLoading={isLoadingSuggestions}
          onSelect={selectSuggestion}
          className="search-suggestion-chips--centered"
        />
      </div>
    </div>
  );
}
