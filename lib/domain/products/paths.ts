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
  return getLowestPriceStore(product)?.store.id ?? product.merchantId ?? null;
}

export async function getProductHref(
  productId: string,
  preferredStoreId?: string | null,
): Promise<string> {
  const product = await getProductById(productId);
  if (!product) return '/brands';
  return getProductHrefFromProduct(product, preferredStoreId);
}

export async function getProductHrefFromProduct(
  product: Product,
  preferredStoreId?: string | null,
): Promise<string> {
  const storeId = resolveStoreIdForProduct(product, preferredStoreId);
  if (!storeId) return '/brands';
  const store = await getStoreById(storeId);
  if (!store) return '/brands';
  return `/brands/${getBrandSlug(store)}/products/${product.id}`;
}
