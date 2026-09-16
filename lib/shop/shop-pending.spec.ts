import { describe, expect, it } from 'vitest';
import {
  shopBrowsePendingLabel,
  shopHubPendingLabel,
} from '@/lib/shop/shop-pending';
import type { ShopBrowseState } from '@/lib/shop/shop-browse-params';

const baseState: ShopBrowseState = {
  sort: 'relevance',
  gender: 'female',
};

describe('shop pending labels', () => {
  it('uses Daydream-style taste line for subcategory swaps', () => {
    expect(
      shopBrowsePendingLabel({ heading: 'Bukser', state: baseState }),
    ).toBe('Finner smaken din for: Bukser');
  });

  it('keeps specific copy for concrete filters', () => {
    expect(
      shopBrowsePendingLabel({
        heading: 'Jeans',
        state: { ...baseState, onSale: true },
      }),
    ).toBe('Finner jeans på salg');
  });

  it('labels hub navigation and audience swaps', () => {
    expect(shopHubPendingLabel({ navigating: true })).toBe('Åpner utvalget');
    expect(
      shopHubPendingLabel({ audienceSwapping: true, suitableFor: 'male' }),
    ).toBe('Bytter til herre');
  });
});
