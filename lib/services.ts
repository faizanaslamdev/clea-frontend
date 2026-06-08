/**
 * Public domain API — re-exports for app and components.
 * Implementation lives under lib/domain/.
 */
export {
  resolveProductSearch,
  type ProductSearchResponse,
} from '@/lib/domain/products/search';

export { getLowestPriceStore } from '@/lib/domain/products/comparison';

export { resolveStoreFromRouteParam } from '@/lib/domain/stores/catalog';

export { searchStores } from '@/lib/domain/stores/search';

export { getBrandSlug, getBrandHref } from '@/lib/domain/stores/slug';

export { resolveStoreIdForProduct } from '@/lib/domain/products/paths';

export { formatPrice } from '@/lib/domain/format';
