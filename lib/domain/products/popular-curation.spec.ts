import { describe, expect, it } from 'vitest';
import {
  dedupeProductsById,
  interleaveProductGroups,
} from '@/lib/domain/products/popular-curation';
import type { Product } from '@/lib/types';

function product(id: string, brand: string): Product {
  return {
    id,
    name: id,
    brand,
    category: 'Fashion',
    image: '',
    description: '',
    sku: id,
    matchType: 'exact',
    rating: 0,
    reviewCount: 0,
    prices: {},
    priceHistory: [],
    inStock: {},
    lowestPrice: 0,
    highestPrice: 0,
    averagePrice: 0,
    savingsPercent: 0,
    trending: true,
    trendingScore: 0,
  };
}

describe('interleaveProductGroups', () => {
  it('round-robins brands so blocks are mixed', () => {
    const result = interleaveProductGroups([
      [product('n1', 'NLY'), product('n2', 'NLY'), product('n3', 'NLY')],
      [product('e1', 'Nelly'), product('e2', 'Nelly')],
      [product('z1', 'Zalando')],
    ]);

    expect(result.map((p) => p.id)).toEqual([
      'n1',
      'e1',
      'z1',
      'n2',
      'e2',
      'n3',
    ]);
  });

  it('skips empty groups and continues', () => {
    const result = interleaveProductGroups([
      [],
      [product('a1', 'A')],
      [product('b1', 'B'), product('b2', 'B')],
    ]);
    expect(result.map((p) => p.id)).toEqual(['a1', 'b1', 'b2']);
  });
});

describe('dedupeProductsById', () => {
  it('keeps first occurrence', () => {
    const a = product('1', 'A');
    const b = product('1', 'A');
    const c = product('2', 'B');
    expect(dedupeProductsById([a, b, c]).map((p) => p.id)).toEqual(['1', '2']);
  });
});
