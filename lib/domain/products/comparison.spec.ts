import { describe, expect, it } from 'vitest';
import { getListingPriceStore, getLowestPriceStore } from './comparison';
import type { Product } from '@/lib/types';

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Test Boot',
    brand: 'Viking',
    category: 'Fashion',
    image: '/boot.webp',
    images: ['/boot.webp'],
    description: '',
    sku: 'sku-1',
    matchType: 'similar',
    rating: 0,
    reviewCount: 0,
    prices: { '336878': 1400 },
    priceHistory: [],
    inStock: { '336878': false },
    lowestPrice: 1400,
    highestPrice: 1400,
    averagePrice: 1400,
    savingsPercent: 0,
    trending: false,
    trendingScore: 0,
    currency: 'NOK',
    merchantId: '336878',
    merchantName: 'Viking Footwear',
    ...overrides,
  };
}

describe('getListingPriceStore', () => {
  it('shows out-of-stock price when no in-stock offer exists', () => {
    const listing = getListingPriceStore(buildProduct());

    expect(listing).toEqual(
      expect.objectContaining({
        price: 1400,
        inStock: false,
      }),
    );
  });

  it('prefers in-stock listing merchant price when available', () => {
    const listing = getListingPriceStore(
      buildProduct({
        prices: { '336878': 1400, '18620': 880 },
        inStock: { '336878': false, '18620': true },
      }),
      '18620',
    );

    expect(listing).toEqual(
      expect.objectContaining({
        price: 880,
        inStock: true,
      }),
    );
  });
});

describe('getLowestPriceStore', () => {
  it('still ignores out-of-stock offers for purchase comparison', () => {
    expect(getLowestPriceStore(buildProduct())).toBeNull();
  });
});
