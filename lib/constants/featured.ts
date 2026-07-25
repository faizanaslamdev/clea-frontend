/** Number of merchants shown on the home brand grid (from API). */
export const FEATURED_MERCHANT_LIMIT = 9;

/**
 * @deprecated Prefer POPULAR_SECTION_BRANDS — kept for any deep links that still
 * reference the historical NLY Man NO carousel focus.
 */
export const POPULAR_PRODUCTS_MERCHANT_ID = '19567';

export const POPULAR_PRODUCTS_MERCHANT_NAME = 'NLY Man NO';

/** Route slug for `/brands/[slug]` (from merchant display name). */
export const POPULAR_PRODUCTS_MERCHANT_SLUG = 'nly-man-no';

/** @deprecated Import from `@/lib/constants/popular-brands` instead. */
export {
  POPULAR_PRODUCTS_LIMIT,
  POPULAR_PRODUCTS_PER_BRAND,
  POPULAR_SECTION_BRANDS,
} from '@/lib/constants/popular-brands';
