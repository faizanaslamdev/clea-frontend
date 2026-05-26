import { HOME_FEATURED_PRODUCT_IDS } from '@/lib/constants/featured';
import { products } from '@/lib/data/dummy-data';
import type { Product } from '@/lib/types';

export function getAllProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getTrendingProducts(limit = 6): Product[] {
  return products
    .filter((p) => p.trending)
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit);
}

export function getHomeFeaturedProducts(limit = 8): Product[] {
  return HOME_FEATURED_PRODUCT_IDS.map((id) => getProductById(String(id)))
    .filter((p): p is Product => p != null)
    .slice(0, limit);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductsByStoreId(storeId: string): Product[] {
  return products.filter(
    (p) => p.prices[storeId] != null && p.inStock[storeId] !== false,
  );
}

export function getSimilarProducts(productId: string, limit = 4): Product[] {
  const product = getProductById(productId);
  if (!product) return [];

  return products
    .filter((p) => p.id !== productId && p.category === product.category)
    .slice(0, limit);
}
