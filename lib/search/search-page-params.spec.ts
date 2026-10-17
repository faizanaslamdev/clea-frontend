import { describe, expect, it } from 'vitest';
import { buildSearchPageQuery, parseSearchPageState, searchParamsFor } from '@/lib/search/search-page-params';

describe('search page params', () => {
  it('round-trips the query, audience hint and Shop filter params', () => {
    const state = parseSearchPageState(
      new URLSearchParams('q=svarte jeans&for=herre&butikk=hm,ellos&farge=black&merke=Levi%27s&max=800&salg=1&sort=price_asc'),
    );
    expect(state.q).toBe('svarte jeans');
    expect(state.audienceHint).toBe('male');
    expect(searchParamsFor(state)).toEqual({
      q: 'svarte jeans',
      audienceHint: 'male',
      merchantIds: ['ellos', 'hm'],
      brandValues: ["Levi's"],
      colourFamilies: ['black'],
      minPrice: undefined,
      maxPrice: 800,
      onSale: true,
      sort: 'price_asc',
    });
    const again = parseSearchPageState(new URLSearchParams(buildSearchPageQuery(state)));
    expect(searchParamsFor(again)).toEqual(searchParamsFor(state));
  });

  it('defaults to no filters', () => {
    const state = parseSearchPageState(new URLSearchParams('q=ryggsekk'));
    expect(searchParamsFor(state)).toMatchObject({ q: 'ryggsekk', merchantIds: undefined, sort: 'relevance' });
    expect(buildSearchPageQuery(state)).toBe('q=ryggsekk');
  });
});
