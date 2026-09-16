import { describe, expect, it } from 'vitest';
import { catalogFiltersForShopHref } from '@/lib/shop/prefetch-shop-browse';
import {
  SHOP_QUICK_SUGGESTIONS_FEMALE,
  SHOP_QUICK_SUGGESTIONS_MALE,
  shopQuickSuggestionHref,
  shopQuickSuggestionsFor,
} from '@/lib/shop/shop-quick-suggestions';
import { categoryGridForShop } from '@/lib/constants/category-grid';
import { shopBrowseHrefForGridEntry } from '@/lib/constants/shop-categories';

describe('shop quick suggestions vs category cards', () => {
  it('keeps equal-length audience lists', () => {
    expect(SHOP_QUICK_SUGGESTIONS_FEMALE).toHaveLength(8);
    expect(SHOP_QUICK_SUGGESTIONS_MALE).toHaveLength(8);
  });

  it('does not reuse the same href set as the category cards', () => {
    for (const audience of ['female', 'male'] as const) {
      const cardHrefs = new Set(
        categoryGridForShop(audience)
          .map((entry) => shopBrowseHrefForGridEntry(entry.id, audience))
          .filter(Boolean),
      );
      const pillHrefs = shopQuickSuggestionsFor(audience).map((entry) =>
        shopQuickSuggestionHref(entry, audience),
      );
      for (const href of pillHrefs) {
        expect(cardHrefs.has(href)).toBe(false);
      }
    }
  });
});

describe('catalogFiltersForShopHref', () => {
  it('maps a gendered sub-shelf to catalog filters', () => {
    expect(catalogFiltersForShopHref('/shop/bukser-jeans?sub=jeans&gender=herre')).toEqual(
      expect.objectContaining({
        ontologyCategoryIds: ['apparel.bottoms.jeans'],
        suitableFor: 'male',
        segment: 'all',
      }),
    );
  });

  it('omits suitableFor for non-gendered beauty', () => {
    expect(catalogFiltersForShopHref('/shop/skjonnhet?sub=sminke')).toEqual(
      expect.objectContaining({
        ontologyCategoryIds: ['beauty.makeup'],
        suitableFor: undefined,
      }),
    );
  });

  it('returns null for non-browse paths', () => {
    expect(catalogFiltersForShopHref('/shop')).toBeNull();
    expect(catalogFiltersForShopHref('/chat')).toBeNull();
  });
});
