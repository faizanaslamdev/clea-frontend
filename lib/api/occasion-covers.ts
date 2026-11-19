import { fetchCatalogFromApi } from '@/lib/api/products';
import type { ShopCategory } from '@/lib/api/chat-types';
import { HOME_OCCASIONS, type HomeOccasion } from '@/lib/constants/occasions';
import type { Product } from '@/lib/types';

/** Names that clearly belong to the other audience, whatever the shop tagged. */
const OTHER_AUDIENCE: Record<ShopCategory, RegExp> = {
  womens: /\b(herre|herrer|men['’´]?s|for men|man['’´]s)\b/i,
  mens: /\b(dame|damer|kjole|women['’´]?s|for women|ladies|woman['’´]s)\b/i,
};

/** Exported for tests: the first product with a picture that fits the audience. */
export function pickOccasionCover(products: Product[], shopCategory: ShopCategory): Product | null {
  return products.find((p) => p.image && !OTHER_AUDIENCE[shopCategory].test(p.name)) ?? null;
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
  return Promise.all(
    HOME_OCCASIONS.map(async (occasion) => {
      try {
        const page = await fetchCatalogFromApi({
          q: occasion.cover[shopCategory],
          suitableFor,
          limit: 8,
          segment: 'fashion',
        });
        return { occasion, product: pickOccasionCover(page.products, shopCategory) };
      } catch {
        return { occasion, product: null };
      }
    }),
  );
}
