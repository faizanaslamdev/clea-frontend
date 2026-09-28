export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatPrice(price: number, currency = 'NOK'): string {
  return price.toLocaleString('nb-NO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  });
}

/** Site UI locale for price qualifier labels (no full i18n system). */
export type PriceDisplayLocale = 'nb' | 'en';

/**
 * Formats a listing price, optionally with a "from" qualifier when the stored
 * amount is a minimum across size (or similar) variants.
 */
export function formatListingPrice(
  price: number,
  currency = 'NOK',
  options?: {
    isFromPrice?: boolean;
    locale?: PriceDisplayLocale;
  },
): string {
  const formatted = formatPrice(price, currency);
  if (!options?.isFromPrice) {
    return formatted;
  }
  const locale = options.locale ?? 'nb';
  const prefix = locale === 'en' ? 'From' : 'Fra';
  return `${prefix} ${formatted}`;
}

/**
 * Presentation-only fix for raw ALL-CAPS merchant feed titles leaking into
 * product cards / modals. Mirrors clea-backend's
 * src/common/util/display-name.util.ts (same rule, kept in sync by hand
 * since frontend and backend don't share a package) — deliberately
 * conservative: only rewrites a name when the *entire* string is shouting.
 * Mixed-case names ("UGG M Classic Mini", "Nike Air Force 1 '07") are left
 * untouched so intentional brand styling is never second-guessed.
 */
export function toDisplayCase(name: string | null | undefined): string {
  if (!name) {
    return '';
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return '';
  }

  const hasLetters = /[a-zA-ZæøåÆØÅ]/.test(trimmed);
  const isAllUpper = hasLetters && trimmed === trimmed.toUpperCase();

  if (!isAllUpper) {
    return trimmed;
  }

  return trimmed
    .toLowerCase()
    .replace(/(^|[\s/-])([a-zæøå])/g, (_match, boundary, letter) => boundary + letter.toUpperCase());
}
