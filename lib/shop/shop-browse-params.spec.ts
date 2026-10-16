import { describe, expect, it } from 'vitest';
import { findShopCategory } from '@/lib/constants/shop-categories';
import {
  buildShopBrowseQuery,
  countShopDrawerFilters,
  emptyShopBrowseState,
  parseShopBrowseState,
  shopBrowseFilters,
  toggleBrandValue,
  toggleListValue,
} from '@/lib/shop/shop-browse-params';

const bottoms = findShopCategory('bukser-jeans')!;
const beauty = findShopCategory('skjonnhet')!;
const parse = (query: string, category = bottoms) =>
  parseShopBrowseState(new URLSearchParams(query), category);

describe('Shop browse URL state (multi-select)', () => {
  it('round-trips several stores, brands and colours', () => {
    const state = {
      ...emptyShopBrowseState('male'),
      merchantIds: ['hm', 'ellos'],
      brands: ["Levi's", 'Tommy Hilfiger, Jeans'],
      colours: ['blue', 'black'],
      onSale: true as const,
    };
    const query = buildShopBrowseQuery(state);
    expect(parse(query)).toEqual(state);
  });

  it('still reads old single-value links', () => {
    const state = parse('butikk=hm&merke=adidas&farge=blue');
    expect(state.merchantIds).toEqual(['hm']);
    expect(state.brands).toEqual(['adidas']);
    expect(state.colours).toEqual(['blue']);
  });

  it('drops unknown colours and duplicates', () => {
    expect(parse('farge=blue,sparkly,blue,gold').colours).toEqual(['blue', 'gold']);
  });

  it('ignores colour on Beauty (shades are not product colours)', () => {
    expect(parse('farge=red', beauty).colours).toEqual([]);
  });

  it('maps to API filters with stable order (same cache key for same choice)', () => {
    const a = shopBrowseFilters(bottoms, parse('butikk=hm,ellos&farge=black,blue'));
    const b = shopBrowseFilters(bottoms, parse('butikk=ellos,hm&farge=blue,black'));
    expect(a).toEqual(b);
    expect(a).toMatchObject({
      merchantIds: ['ellos', 'hm'],
      colourFamilies: ['black', 'blue'],
      suitableFor: 'female',
      segment: 'all',
    });
    expect(a.merchantId).toBeUndefined();
    expect(a.colour).toBeUndefined();
  });

  it('counts each selected value as one active filter', () => {
    expect(countShopDrawerFilters(parse('butikk=hm,ellos&merke=adidas&min=100&max=500'))).toBe(4);
  });

  it('toggles list values', () => {
    expect(toggleListValue(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleListValue(['a', 'b'], 'a')).toEqual(['b']);
  });
});

describe('Shop brand selection is case-insensitive (backend matches LOWER(brand))', () => {
  it('unticks a brand whose URL spelling differs from the facet label', () => {
    expect(toggleBrandValue(['ADIDAS', 'Nike'], 'adidas')).toEqual(['Nike']);
  });

  it('adds a brand that is not selected in any spelling', () => {
    expect(toggleBrandValue(['Nike'], 'adidas')).toEqual(['Nike', 'adidas']);
  });

  it('keeps one spelling when the URL repeats a brand in different case', () => {
    expect(parse('merke=adidas&merke=ADIDAS&merke=Nike').brands).toEqual(['adidas', 'Nike']);
  });
});
