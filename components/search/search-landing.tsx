'use client';

import { useState } from 'react';
import { HeroSearchForm } from '@/components/hero-search-form';
import { SearchSuggestionChips } from '@/components/search/search-suggestion-chips';
import { TypewriterText } from '@/components/shared/typewriter-text';
import { SEARCH_HEADLINE_EXAMPLES, SEARCH_PLACEHOLDER_EXAMPLES } from '@/lib/constants/search-prompts';
import { useLandingSuggestions } from '@/lib/hooks/useLandingSuggestions';

export function SearchLanding() {
  const { shopCategory, setShopCategory, suggestions, isLoadingSuggestions, selectSuggestion } =
    useLandingSuggestions();
  // Controlled here (instead of left uncontrolled inside HeroSearchForm) so
  // the headline's type/delete/next-phrase loop can see it and freeze --
  // otherwise it kept cycling underneath whatever the user was typing.
  const [query, setQuery] = useState('');

  return (
    <section className="search-landing section-container" aria-label="Søk">
      <header className="search-landing__header">
        <h1 className="search-landing__title">
          <span className="search-landing__title-line">Søk etter</span>
          <TypewriterText
            phrases={SEARCH_HEADLINE_EXAMPLES}
            className="search-landing__typewriter"
            contentClassName="search-landing__highlight"
            showCursor
            paused={query.trim().length > 0}
          />
        </h1>
        <p className="search-landing__subtext">
          Fortell oss hva du leter etter — en anledning, en stil, et skjermbilde
          — så finner vi det på tvers av tusenvis av merker.
        </p>
      </header>

      <div className="search-landing__search-wrap layout-inner-medium">
        <HeroSearchForm
          variant="full"
          appearance="floating"
          idPrefix="search-landing"
          value={query}
          onValueChange={setQuery}
          shopCategory={shopCategory}
          onShopCategoryChange={setShopCategory}
          animatedPlaceholderPhrases={SEARCH_PLACEHOLDER_EXAMPLES[shopCategory]}
        />
      </div>

      <div className="search-landing__suggestions">
        <SearchSuggestionChips
          suggestions={suggestions}
          isLoading={isLoadingSuggestions}
          onSelect={selectSuggestion}
          className="search-suggestion-chips--centered"
        />
      </div>
    </section>
  );
}
