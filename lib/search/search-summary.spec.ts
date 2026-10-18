import { describe, expect, it } from 'vitest';
import type { SearchUnderstanding } from '@/lib/api/search';
import { relaxationNotices, understoodChips } from '@/lib/search/search-summary';

const base: SearchUnderstanding = {
  categoryIds: ['apparel.bottoms.jeans'],
  categoryTerms: ['jeans'],
  audience: 'male',
  colourFamilies: ['black'],
  brands: ["levi's"],
  brandLabels: ["Levi's"],
  merchantIds: [],
  minPrice: null,
  maxPrice: 800,
  onSale: false,
  textWords: [],
};

describe('understoodChips', () => {
  it('lists category, audience, colour, brand and price in reading order', () => {
    expect(understoodChips(base, (id) => id)).toEqual(['Jeans', 'Herre', 'Svart', "Levi's", 'Under 800 kr']);
  });
});

describe('relaxationNotices', () => {
  it('names exactly what was dropped', () => {
    expect(
      relaxationNotices(['colour', 'brand'], { ...base, colourFamilies: ['purple', 'pink'] }, false),
    ).toEqual(['Fant ingen i lilla eller rosa – viser andre farger.', "Fant ingen fra Levi's – viser andre merker."]);
    expect(relaxationNotices(['audience'], base, true)).toEqual(['Få treff merket for herre – viser for alle.']);
    expect(relaxationNotices(['words'], { ...base, textWords: ['linen'] }, false)[0]).toContain('«linen»');
  });

  it('says sparse words now rank the results', () => {
    const note = relaxationNotices(['words_ranked'], { ...base, textWords: ['bryllup'] }, false)[0];
    expect(note).toContain('«bryllup»');
    expect(note).toContain('vises først');
  });
});
