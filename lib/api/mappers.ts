import type { ApiMerchant, ApiProduct } from '@/lib/api/types';
import type { Product, ProductCategory, Store } from '@/lib/types';
import { normalizeFeedImageUrl } from '@/lib/utils/feed-image-url';
import { buildProductImageGallery } from '@/lib/utils/product-feed-meta';

const PLACEHOLDER_IMAGE = '/products/tshirt.jpg';

function parseAmount(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

function mapCategory(category: string | null): ProductCategory {
  const c = (category ?? '').toLowerCase();
  if (
    c.includes('beauty') ||
    c.includes('skjønnhet') ||
    c.includes('cosmetic') ||
    c.includes('makeup') ||
    c.includes('serum') ||
    c.includes('hudpleie')
  ) {
    return 'Beauty';
  }
  if (
    c.includes('accessor') ||
    c.includes('tilbehør') ||
    c.includes('cap') ||
    c.includes('hat') ||
    c.includes('bag') ||
    c.includes('veske') ||
    c.includes('smykke') ||
    c.includes('jewel')
  ) {
    return 'Accessories';
  }
  return 'Fashion';
}

function buildPriceHistory(
  api: ApiProduct,
  storeId: string,
  price: number,
  oldPrice: number | null,
): Product['priceHistory'] {
  const today = new Date().toISOString().slice(0, 10);
  const points: Product['priceHistory'] = [
    { date: today, price, store: storeId },
  ];

  if (oldPrice != null && oldPrice > price) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    points.unshift({
      date: weekAgo.toISOString().slice(0, 10),
      price: oldPrice,
      store: storeId,
    });
  }

  return points;
}

export function mapApiProductToProduct(api: ApiProduct): Product {
  const storeId = api.merchant_id ?? 'unknown';
  const price = parseAmount(api.price);
  const oldPrice = api.old_price != null ? parseAmount(api.old_price) : null;
  const prices: Product['prices'] = { [storeId]: price };
  const inStock: Product['inStock'] = { [storeId]: api.in_stock };
  const priceValues = Object.values(prices);
  const lowestPrice = Math.min(...priceValues);
  const highestPrice = Math.max(...priceValues);
  const averagePrice =
    priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
  const savingsPercent =
    highestPrice > 0
      ? Math.round(((highestPrice - lowestPrice) / highestPrice) * 100)
      : 0;

  const updatedAt = new Date(api.last_updated).getTime();
  const trendingScore = Math.max(0, 1_000_000_000 - updatedAt);
  const images = buildProductImageGallery(
    api.image_url,
    api.alternate_images,
    normalizeFeedImageUrl,
  );
  const primaryImage = images[0] ?? PLACEHOLDER_IMAGE;

  return {
    id: api.id,
    name: api.name,
    brand: api.brand ?? api.merchant_name ?? 'Ukjent merke',
    category: mapCategory(api.category ?? api.category_path),
    image: primaryImage,
    images: images.length > 0 ? images : [PLACEHOLDER_IMAGE],
    description: api.description?.trim() ?? '',
    sku: api.merchant_product_id ?? api.aw_product_id,
    matchType: 'similar',
    rating: 0,
    reviewCount: 0,
    prices,
    priceHistory: buildPriceHistory(api, storeId, price, oldPrice),
    inStock,
    lowestPrice,
    highestPrice,
    averagePrice,
    savingsPercent,
    trending: true,
    trendingScore,
    currency: api.currency ?? 'NOK',
    deepLink: api.deep_link,
    merchantId: storeId,
    merchantName: api.merchant_name ?? undefined,
    colour: api.colour ?? undefined,
    size: api.size ?? undefined,
    suitableFor: api.suitable_for ?? undefined,
    productType: api.product_type ?? undefined,
    condition: api.condition ?? undefined,
    categoryPath: api.category_path ?? api.category ?? undefined,
    brandId: api.brand_id ?? undefined,
    dataFeedId: api.data_feed_id ?? undefined,
    isForSale: api.is_for_sale ?? undefined,
  };
}

export function mapApiMerchantToStore(api: ApiMerchant): Store {
  return {
    id: api.id,
    name: api.name,
    country: 'Norway',
    currency: api.currency,
    coverImage:
      normalizeFeedImageUrl(api.coverImage) ?? PLACEHOLDER_IMAGE,
    size: api.productCount > 500 ? 'lg' : api.productCount > 100 ? 'md' : 'sm',
    productCount: api.productCount,
  };
}
