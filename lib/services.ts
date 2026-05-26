/**
 * Public domain API — re-exports for app and components.
 * Implementation lives under lib/domain/.
 */
export {
  getAllProducts,
  getProductById,
  getTrendingProducts,
  getHomeFeaturedProducts,
  getProductsByCategory,
  getSimilarProducts,
  getProductsByStoreId,
} from '@/lib/domain/products/catalog';

export { searchProducts } from '@/lib/domain/products/search';

export {
  filterByPriceRange,
  filterByRating,
  sortProducts,
} from '@/lib/domain/products/filters';

export {
  getLowestPriceStore,
  getProductComparison,
  getPriceChartData,
  getMatchTypeLabel,
} from '@/lib/domain/products/comparison';

export { getPriceAIInsights } from '@/lib/domain/products/insights';

export {
  getStoreById,
  getStoreBySlug,
  resolveStoreFromRouteParam,
  getAllStores,
  getFeaturedStores,
} from '@/lib/domain/stores/catalog';

export { searchStores } from '@/lib/domain/stores/search';

export { getBrandSlug, getBrandHref } from '@/lib/domain/stores/slug';

export {
  buildBrandVisitLink,
  type BrandVisitLink,
  type BrandVisitLinkOptions,
} from '@/lib/domain/stores/visit-link';

export { resolveStoreIdForProduct } from '@/lib/domain/products/paths';

export { formatDateShort, formatPrice } from '@/lib/domain/format';
