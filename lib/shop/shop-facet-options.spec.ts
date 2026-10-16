import { describe, expect, it } from 'vitest';
import type { CatalogFacets } from '@/lib/api/products';
import { SHOP_COLOUR_OPTIONS } from '@/lib/shop/shop-colours';
import {
  brandFacetOptions,
  colourFacetOptions,
  storeFacetOptions,
} from '@/lib/shop/shop-facet-options';
import type { Store } from '@/lib/types';

const facets: CatalogFacets = {
  total: 62,
  stores: [
    { id: 'ellos', count: 8 },
    { id: '20000', count: 30 },
  ],
  brands: [
    { brand: 'adidas', count: 30 },
    { brand: 'Vero Moda', count: 4 },
    { brand: "Levi's", count: 4 },
  ],
  colours: [
    { value: 'blue', count: 20 },
    { value: 'gold', count: 2 },
  ],
  onSaleCount: 3,
};

const stores = [
  { id: '20000', name: 'adidas NO' },
  { id: 'ellos', name: 'Ellos' },
  { id: '60821', name: 'Sephora SE' },
] as Store[];

describe('Shop facet options', () => {
  it('lists only stores with products on the page, biggest first, with names', () => {
    expect(storeFacetOptions(facets, [], stores)).toEqual([
      { value: '20000', label: 'adidas NO', count: 30, selected: false },
      { value: 'ellos', label: 'Ellos', count: 8, selected: false },
    ]);
  });

  it('keeps a selected store visible even when it has nothing here', () => {
    const options = storeFacetOptions(facets, ['60821'], stores);
    expect(options[0]).toEqual({ value: '60821', label: 'Sephora SE', count: 0, selected: true });
  });

  it('searches brands case-insensitively and puts selected brands first', () => {
    expect(brandFacetOptions(facets, [], 'LEV').map((o) => o.label)).toEqual(["Levi's"]);
    expect(brandFacetOptions(facets, ['vero moda']).map((o) => o.label)).toEqual([
      'Vero Moda',
      'adidas',
      "Levi's",
    ]);
  });

  it('shows colours in palette order, only those present', () => {
    expect(colourFacetOptions(facets, [], SHOP_COLOUR_OPTIONS).map((o) => o.value)).toEqual([
      'blue',
      'gold',
    ]);
    expect(colourFacetOptions(facets, ['red'], SHOP_COLOUR_OPTIONS).map((o) => o.value)).toEqual([
      'blue',
      'red',
      'gold',
    ]);
  });
});
