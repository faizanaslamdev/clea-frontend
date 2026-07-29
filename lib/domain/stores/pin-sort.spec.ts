import { describe, expect, it } from 'vitest';
import { sortStoresWithPinned } from '@/lib/domain/stores/pin-sort';
import type { Store } from '@/lib/types';

function store(partial: Partial<Store> & Pick<Store, 'id' | 'name'>): Store {
  return {
    country: 'Norway',
    currency: 'NOK',
    coverImage: '/x.jpg',
    productCount: 10,
    ...partial,
  };
}

describe('sortStoresWithPinned', () => {
  it('pins NLYMAN, Nelly, then Ralph Lauren', () => {
    const result = sortStoresWithPinned([
      store({ id: 'z', name: 'Zalando', productCount: 100 }),
      store({ id: 'ralph', name: 'Ralph Lauren NO', productCount: 90 }),
      store({ id: 'nelly', name: 'Nelly NO', productCount: 50 }),
      store({ id: 'awin', name: 'Boozt', productCount: 80 }),
      store({ id: '19567', name: 'NLY Man NO', productCount: 200 }),
    ]);

    expect(result.map((s) => s.name)).toEqual([
      'NLY Man NO',
      'Nelly NO',
      'Ralph Lauren NO',
      'Boozt',
      'Zalando',
    ]);
  });

  it('skips pinned brands that are missing from the list', () => {
    const result = sortStoresWithPinned([
      store({ id: 'nelly', name: 'Nelly.com', productCount: 12 }),
      store({ id: 'z', name: 'Zalando', productCount: 5 }),
    ]);

    expect(result.map((s) => s.name)).toEqual(['Nelly.com', 'Zalando']);
  });

  it('does not invent placeholder or zero-product brands', () => {
    const result = sortStoresWithPinned([
      store({ id: '19567', name: 'NLY Man NO', productCount: 0 }),
      store({ id: 'nelly', name: 'Nelly.com', productCount: 0 }),
      store({ id: 'z', name: 'Zalando', productCount: 5 }),
    ]);

    expect(result.map((s) => s.name)).toEqual(['Zalando']);
  });

  it('sorts remaining brands alphabetically (nb locale)', () => {
    const result = sortStoresWithPinned([
      store({ id: '3', name: 'Økologisk', productCount: 1 }),
      store({ id: '1', name: 'Adidas', productCount: 1 }),
      store({ id: '2', name: 'Boozt', productCount: 1 }),
    ]);

    expect(result.map((s) => s.name)).toEqual([
      'Adidas',
      'Boozt',
      'Økologisk',
    ]);
  });

  it('matches NLYMAN alias case-insensitively', () => {
    const result = sortStoresWithPinned([
      store({ id: '1', name: 'nlyman', productCount: 3 }),
      store({ id: '2', name: 'Adidas', productCount: 1 }),
    ]);

    expect(result[0]?.name).toBe('nlyman');
  });

  it('does not duplicate Ralph Lauren alias variants', () => {
    const result = sortStoresWithPinned([
      store({ id: 'nly', name: 'NLY Man NO' }),
      store({ id: 'nelly', name: 'Nelly NO' }),
      store({ id: 'ralph-no', name: 'Ralph Lauren NO' }),
      store({ id: 'ralph', name: 'Ralph Lauren' }),
      store({ id: 'viking', name: 'Viking Footwear' }),
    ]);

    expect(result.map((store) => store.name)).toEqual([
      'NLY Man NO',
      'Nelly NO',
      'Ralph Lauren NO',
      'Viking Footwear',
    ]);
  });
});
