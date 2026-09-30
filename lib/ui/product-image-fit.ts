/**
 * Central product-image object-fit policy for catalog imagery.
 *
 * Default: object-cover + object-center.
 * Exception merchants (packshot-heavy feeds): object-contain + object-center.
 *
 * Prefer merchantId matching. merchantName is a fallback for surfaces that
 * only carry a display name (e.g. some chat snapshots).
 */

export type ProductImageFit = 'cover' | 'contain';

export type ProductImageMerchantRef = {
  merchantId?: string | null;
  merchantName?: string | null;
};

/**
 * Canonical catalog `merchant_id` values (from live CLEA product rows).
 * Edit this set only when adding/removing a contain exception.
 */
export const CONTAIN_IMAGE_MERCHANT_IDS = new Set<string>([
  '109844', // DB Journey NO
  '18620', // Outnorth NO
  'kicks', // KICKS
  '60821', // Sephora SE
  '286201', // Urverket
]);

/**
 * Exact display-name aliases (case-insensitive) for ID-less surfaces.
 * Keep in sync with CONTAIN_IMAGE_MERCHANT_IDS.
 */
export const CONTAIN_IMAGE_MERCHANT_NAME_ALIASES = new Set<string>([
  'db journey no',
  'outnorth no',
  'kicks',
  'sephora se',
  'urverket',
  'urverket no',
]);

function normalizeMerchantKey(value: string): string {
  return value.trim().toLowerCase();
}

export function isContainImageMerchant(
  ref: ProductImageMerchantRef | null | undefined,
): boolean {
  if (!ref) return false;

  const id = ref.merchantId?.trim();
  if (id) {
    return CONTAIN_IMAGE_MERCHANT_IDS.has(id);
  }

  const name = ref.merchantName?.trim();
  if (name) {
    return CONTAIN_IMAGE_MERCHANT_NAME_ALIASES.has(normalizeMerchantKey(name));
  }

  return false;
}

/** Fit mode for a catalog product image. Missing/unknown merchant → cover. */
export function getProductImageFit(
  ref: ProductImageMerchantRef | null | undefined,
): ProductImageFit {
  return isContainImageMerchant(ref) ? 'contain' : 'cover';
}

/** Tailwind utilities implementing the central fit + center policy. */
export function getProductImageFitClassName(
  ref: ProductImageMerchantRef | null | undefined,
): string {
  return getProductImageFit(ref) === 'contain'
    ? 'object-contain object-center'
    : 'object-cover object-center';
}
