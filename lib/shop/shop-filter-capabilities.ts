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
   * Clothing/shoe colour from structured `product.colour`.
   * Off for beauty / watches / accessories (wrong semantics or no data).
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
 * Apparel (incl. footwear, bags, socks, legwear): colour + sale.
 * Beauty: no clothing colour; sale kept (Sephora old_price coverage).
 * Watches / accessories: brand/store/price/sort only.
 */
export function shopFilterCapabilities(
  category: ShopCategory,
): ShopFilterCapabilities {
  const branch = ontologyBranch(category.ontologyId);

  const isBeauty = branch === 'beauty';
  const isWatches = branch === 'watches';
  const isAccessories = branch === 'accessories';

  return {
    subcategory: category.children.length > 0,
    brand: true,
    store: true,
    price: true,
    colour: !isBeauty && !isWatches && !isAccessories,
    sale: !isWatches && !isAccessories,
    sort: true,
    gender: category.gendered,
  };
}
