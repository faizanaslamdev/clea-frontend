import { fetchCatalogFromApi } from '@/lib/api/products';
import type { ShopCategory } from '@/lib/api/chat-types';
import { HOME_OCCASIONS, type HomeOccasion } from '@/lib/constants/occasions';
import type { Product } from '@/lib/types';

/**
 * Shops whose product photos are worn by a model (Nelly, Bubbleroom, Ralph
 * Lauren). Flat-lay cut-outs from the other shops look like a stock list on
 * the landing page.
 */
const ON_MODEL_MERCHANTS = ['19563', 'bubbleroom', '384513'];

/** Sportswear reads as gym, not as an occasion. */
const SPORT_BRANDS = /\b(adidas|nike|puma|reebok|new balance|under armour)\b/i;

/** Names that clearly belong to the other audience, whatever the shop tagged. */
const OTHER_AUDIENCE: Record<ShopCategory, RegExp> = {
  womens: /\b(herre|herrer|men['’´]?s|for men|man['’´]s)\b/i,
  mens: /\b(dame|damer|kjole|women['’´]?s|for women|ladies|woman['’´]s)\b/i,
};

/** Exported for tests: the first product with a picture that fits the audience. */
export function pickOccasionCover(
  products: Product[],
  shopCategory: ShopCategory,
  usedImages: Set<string> = new Set(),
): Product | null {
  return (
    products.find(
      (p) =>
        p.image &&
        !usedImages.has(p.image) &&
        !OTHER_AUDIENCE[shopCategory].test(p.name) &&
        !SPORT_BRANDS.test(`${p.brand} ${p.name}`),
    ) ?? null
  );
}

export interface OccasionCover {
  occasion: HomeOccasion;
  product: Product | null;
}

/**
 * One cover photo per occasion tile, from the catalog for the chosen
 * audience (the app's Home uses the same searches). A tile whose search
 * gives nothing still renders, without a photo.
 */
export async function fetchOccasionCovers(shopCategory: ShopCategory): Promise<OccasionCover[]> {
  const suitableFor = shopCategory === 'mens' ? 'male' : 'female';
  const pages = await Promise.all(
    HOME_OCCASIONS.map(async (occasion) => {
      try {
        const page = await fetchCatalogFromApi({
          q: occasion.cover[shopCategory],
          suitableFor,
          merchantIds: ON_MODEL_MERCHANTS,
          limit: 8,
          segment: 'fashion',
        });
        return page.products;
      } catch {
        return [];
      }
    }),
  );
  // No photo twice across the four tiles.
  const used = new Set<string>();
  return HOME_OCCASIONS.map((occasion, i) => {
    const product = pickOccasionCover(pages[i], shopCategory, used);
    if (product) used.add(product.image);
    return { occasion, product };
  });
}
