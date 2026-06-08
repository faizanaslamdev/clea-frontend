import {
  fetchFeaturedProducts,
  fetchProductById,
  fetchProductsByMerchant,
  fetchCatalogFromApi,
  fetchSimilarProducts,
  fetchTrendingProducts,
} from '@/lib/api/products';
import type { Product } from '@/lib/types';

export interface BrandListingResult {
  products: Product[];
  usedFallback: boolean;
}

export async function getAllProducts(): Promise<Product[]> {
  const { products } = await fetchCatalogFromApi({ limit: 100 });
  return products;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return fetchProductById(id);
}

export async function getTrendingProducts(limit = 6): Promise<Product[]> {
  return fetchTrendingProducts(limit);
}

export async function getHomeFeaturedProducts(limit = 8): Promise<Product[]> {
  return fetchFeaturedProducts(limit);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { products } = await fetchCatalogFromApi({
    category,
    limit: 100,
  });
  return products.filter((p) => p.category === category);
}

export async function resolveBrandProducts(
  storeId: string,
): Promise<BrandListingResult> {
  const products = await fetchProductsByMerchant(storeId, 48);
  return {
    products,
    usedFallback: products.length === 0,
  };
}

export async function getProductsByStoreId(storeId: string): Promise<Product[]> {
  return (await resolveBrandProducts(storeId)).products;
}

export async function getSimilarProducts(
  productId: string,
  limit = 4,
): Promise<Product[]> {
  return fetchSimilarProducts(productId, limit);
}
