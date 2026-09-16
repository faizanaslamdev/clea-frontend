import { describe, expect, it } from 'vitest';
import {
  SHOP_CATEGORIES,
  shopBrowseHrefForGridEntry,
  shopBrowseTargetForGridEntry,
  shopCategoryChildrenFor,
} from '@/lib/constants/shop-categories';
import {
  categoryGridForShop,
  SHOP_CATEGORY_GRID_FEMALE,
  SHOP_CATEGORY_GRID_MALE,
  CATEGORY_SECTION_CARD_COUNT,
} from '@/lib/constants/category-grid';
import {
  SHOP_QUICK_SUGGESTIONS_FEMALE,
  SHOP_QUICK_SUGGESTIONS_MALE,
  shopQuickSuggestionHref,
  shopQuickSuggestionsFor,
} from '@/lib/shop/shop-quick-suggestions';
import { catalogFiltersForShopHref } from '@/lib/shop/prefetch-shop-browse';

/** Ontology ids used by Shop must be non-empty paths from PRODUCT_ONTOLOGY_V1. */
function looksLikeOntologyId(id: string): boolean {
  return /^[a-z][a-z0-9_.]*$/.test(id);
}

describe('SHOP_CATEGORIES static mapping integrity', () => {
  it('has unique category slugs and child slugs within each category', () => {
    const slugs = SHOP_CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const category of SHOP_CATEGORIES) {
      const childSlugs = category.children.map((c) => c.slug);
      expect(new Set(childSlugs).size).toBe(childSlugs.length);
    }
  });

  it('maps every category and child to a plausible ontology id', () => {
    for (const category of SHOP_CATEGORIES) {
      expect(looksLikeOntologyId(category.ontologyId)).toBe(true);
      for (const child of category.children) {
        expect(looksLikeOntologyId(child.ontologyId)).toBe(true);
      }
    }
  });

  it('hides Dame-only chips from Herre (Skjørt, Bluser)', () => {
    const bottoms = SHOP_CATEGORIES.find((c) => c.slug === 'bukser-jeans')!;
    const tops = SHOP_CATEGORIES.find((c) => c.slug === 'overdeler')!;

    const herreBottoms = shopCategoryChildrenFor(bottoms, 'male').map((c) => c.slug);
    const dameBottoms = shopCategoryChildrenFor(bottoms, 'female').map((c) => c.slug);
    expect(herreBottoms).not.toContain('skjort');
    expect(dameBottoms).toContain('skjort');

    const herreTops = shopCategoryChildrenFor(tops, 'male').map((c) => c.slug);
    const dameTops = shopCategoryChildrenFor(tops, 'female').map((c) => c.slug);
    expect(herreTops).not.toContain('bluser');
    expect(dameTops).toContain('bluser');
  });

  it('resolves every configured child sub via catalogFiltersForShopHref', () => {
    for (const category of SHOP_CATEGORIES) {
      for (const child of category.children) {
        const audiences =
          child.audiences && child.audiences.length > 0
            ? child.audiences
            : (['female', 'male'] as const);
        for (const audience of audiences) {
          const genderQ = audience === 'male' ? '&gender=herre' : '';
          const href = `/shop/${category.slug}?sub=${child.slug}${genderQ}`;
          const filters = catalogFiltersForShopHref(href);
          expect(filters, href).not.toBeNull();
          expect(filters?.ontologyCategoryIds).toEqual([child.ontologyId]);
          if (category.gendered) {
            expect(filters?.suitableFor).toBe(audience);
          } else {
            expect(filters?.suitableFor).toBeUndefined();
          }
        }
      }
    }
  });
});

describe('Shop hub cards + quick suggestions integrity', () => {
  it('keeps Dame/Herre card grids at the fixed card count', () => {
    expect(SHOP_CATEGORY_GRID_FEMALE).toHaveLength(CATEGORY_SECTION_CARD_COUNT);
    expect(SHOP_CATEGORY_GRID_MALE).toHaveLength(CATEGORY_SECTION_CARD_COUNT);
    expect(categoryGridForShop('female')).toHaveLength(CATEGORY_SECTION_CARD_COUNT);
    expect(categoryGridForShop('male')).toHaveLength(CATEGORY_SECTION_CARD_COUNT);
  });

  it('maps every shop card to a real browse target', () => {
    for (const audience of ['female', 'male'] as const) {
      for (const entry of categoryGridForShop(audience)) {
        const target = shopBrowseTargetForGridEntry(entry.id);
        expect(target, entry.id).toBeDefined();
        expect(SHOP_CATEGORIES.some((c) => c.slug === target!.slug)).toBe(true);
        if (target!.sub) {
          const category = SHOP_CATEGORIES.find((c) => c.slug === target!.slug)!;
          const visible = shopCategoryChildrenFor(category, audience);
          expect(visible.some((c) => c.slug === target!.sub)).toBe(true);
        }
        const href = shopBrowseHrefForGridEntry(entry.id, audience);
        expect(href).toBeTruthy();
        expect(catalogFiltersForShopHref(href!)).not.toBeNull();
      }
    }
  });

  it('keeps quick suggestions distinct from cards and resolvable', () => {
    expect(SHOP_QUICK_SUGGESTIONS_FEMALE).toHaveLength(8);
    expect(SHOP_QUICK_SUGGESTIONS_MALE).toHaveLength(8);

    for (const audience of ['female', 'male'] as const) {
      const cardHrefs = new Set(
        categoryGridForShop(audience)
          .map((entry) => shopBrowseHrefForGridEntry(entry.id, audience))
          .filter(Boolean),
      );
      for (const suggestion of shopQuickSuggestionsFor(audience)) {
        const href = shopQuickSuggestionHref(suggestion, audience);
        expect(cardHrefs.has(href)).toBe(false);
        const filters = catalogFiltersForShopHref(href);
        expect(filters, href).not.toBeNull();
        expect(filters?.ontologyCategoryIds?.length).toBe(1);
      }
    }
  });
});
