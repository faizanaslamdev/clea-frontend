import type { ShopCategory } from '@/lib/constants/shop-categories';

/**
 * Which Shop browse filters apply for a category.
 *
 * Driven by ontology branch — not scattered `if (slug === '…')` checks in UI.
 * Keep this small; it is not a generic facet engine.
 */
export interface ShopFilterCapabilities {
  /** Subcategory chip row — only when the category defines children. */
  subcategory: boolean;
  brand: boolean;
  store: boolean;
  price: boolean;
  /**
   * Colour family filter (stored at import). Off for beauty, where colour
   * means a shade, not the product colour. Elsewhere the group only shows
   * when the page actually has coloured products (facets).
   */
  colour: boolean;
  /**
   * Proven `old_price > price` sale. Off where catalog coverage is effectively
   * zero (watches / accessories in current feeds).
   */
  sale: boolean;
  sort: boolean;
  /** Same rule as `ShopCategory.gendered`. */
  gender: boolean;
}

function ontologyBranch(ontologyId: string): string {
  const root = ontologyId.split('.')[0] ?? ontologyId;
  return root;
}

/**
 * Resolve filter capabilities for a Shop browse category.
 *
 * Apparel, watches, accessories: colour (gold/silver matter for jewellery
 * and watches) + sale. Beauty: no colour; sale kept.
 * Store / brand / colour / sale groups also hide when the page has no
 * options for them (see the drawer + facets).
 */
export function shopFilterCapabilities(
  category: ShopCategory,
): ShopFilterCapabilities {
  const branch = ontologyBranch(category.ontologyId);

  const isBeauty = branch === 'beauty';

  return {
    subcategory: category.children.length > 0,
    brand: true,
    store: true,
    price: true,
    colour: !isBeauty,
    sale: true,
    sort: true,
    gender: category.gendered,
  };
}
