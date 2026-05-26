import { getProductById } from '@/lib/domain/products/catalog';
import { getLowestPriceStore } from '@/lib/domain/products/comparison';
import { getStoreById } from '@/lib/domain/stores/catalog';
import { getBrandSlug } from '@/lib/domain/stores/slug';
import type { Product } from '@/lib/types';

export function resolveStoreIdForProduct(
  product: Product,
  preferredStoreId?: string | null,
): string | null {
  if (
    preferredStoreId &&
    product.prices[preferredStoreId] != null &&
    product.inStock[preferredStoreId] !== false
  ) {
    return preferredStoreId;
  }
  return getLowestPriceStore(product)?.store.id ?? null;
}

export function getProductHref(
  productId: string,
  preferredStoreId?: string | null,
): string {
  const product = getProductById(productId);
  if (!product) return '/brands';
  return getProductHrefFromProduct(product, preferredStoreId);
}

export function getProductHrefFromProduct(
  product: Product,
  preferredStoreId?: string | null,
): string {
  const storeId = resolveStoreIdForProduct(product, preferredStoreId);
  if (!storeId) return '/brands';
  const store = getStoreById(storeId);
  if (!store) return '/brands';
  return `/brands/${getBrandSlug(store)}/products/${product.id}`;
}
