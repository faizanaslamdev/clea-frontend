'use client';

import { useRouter } from 'next/navigation';
import { HeroSearchForm } from '@/components/hero-search-form';
import { SearchSuggestionChips } from '@/components/search/search-suggestion-chips';
import { TypewriterText } from '@/components/shared/typewriter-text';
import { SEARCH_HEADLINE_EXAMPLES } from '@/lib/constants/search-prompts';

export function SearchLanding() {
  const router = useRouter();

  const handleSuggestion = (query: string) => {
    const params = new URLSearchParams({ q: query });
    router.push(`/chat?${params.toString()}`);
  };

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
        />
      </div>

      <SearchSuggestionChips onSelect={handleSuggestion} />
    </section>
  );
}
