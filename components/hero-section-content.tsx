'use client';

import { HeroSearchForm } from '@/components/hero-search-form';
import { SearchSuggestionChips } from '@/components/search/search-suggestion-chips';
import { BRAND } from '@/lib/constants/brand';
import { placeholderExamplesFor } from '@/lib/constants/search-prompts';
import { useLandingSuggestions } from '@/lib/hooks/useLandingSuggestions';
import { useAudienceReady } from '@/lib/audience/audience';

export function HeroSectionContent() {
  const { shopCategory, setShopCategory, suggestions, isLoadingSuggestions, selectSuggestion } =
    useLandingSuggestions();
  // A visitor who has not chosen Dame/Herre yet gets one line asking once.
  const audienceReady = useAudienceReady();
  const audiencePrompt =
    audienceReady && !shopCategory ? 'Hvem handler du for? Velg én gang, så husker vi det.' : undefined;

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
          audiencePrompt={audiencePrompt}
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
