import type { SuitableFor } from '@/lib/api/chat-types';
import { shopGenderParamFor } from '@/lib/shop/shop-gender';

/**
 * Top Shop hub quick suggestions — narrow, high-signal browse shortcuts.
 *
 * These are intentionally NOT the same list as the category cards below.
 * Cards stay broad curated shelves; pills jump into useful sub-contexts
 * (or destinations the cards do not surface) that the catalog actually supports.
 */
export interface ShopQuickSuggestion {
  id: string;
  label: string;
  /**
   * Browse href without gender. Audience is applied via
   * {@link shopQuickSuggestionHref} for gendered shelves.
   */
  href: string;
}

/**
 * Dame — sub-shelves + beauty (cards: Jeans & bukser, Kjoler, T-skjorter,
 * Topper, Jakker, Sko, Genser & strikk, Vesker).
 */
export const SHOP_QUICK_SUGGESTIONS_FEMALE: readonly ShopQuickSuggestion[] = [
  { id: 'jeans', label: 'Jeans', href: '/shop/bukser-jeans?sub=jeans' },
  { id: 'skjort', label: 'Skjørt', href: '/shop/bukser-jeans?sub=skjort' },
  { id: 'bluser', label: 'Bluser', href: '/shop/overdeler?sub=bluser' },
  {
    id: 'hettegenser',
    label: 'Hettegenser',
    href: '/shop/gensere?sub=hettegenser',
  },
  {
    id: 'vinterjakke',
    label: 'Vinterjakker',
    href: '/shop/jakker?sub=vinterjakke',
  },
  { id: 'sneakers', label: 'Sneakers', href: '/shop/sko?sub=sneakers' },
  { id: 'stovler', label: 'Støvler', href: '/shop/sko?sub=stovler' },
  { id: 'sminke', label: 'Sminke', href: '/shop/skjonnhet?sub=sminke' },
] as const;

/**
 * Herre — sub-shelves + watches (cards: Jeans & bukser, Sokker, T-skjorter,
 * Topper, Jakker, Sko, Genser & strikk, Vesker).
 *
 * Omits empty/weak pill destinations (e.g. male running shoes).
 */
export const SHOP_QUICK_SUGGESTIONS_MALE: readonly ShopQuickSuggestion[] = [
  { id: 'jeans', label: 'Jeans', href: '/shop/bukser-jeans?sub=jeans' },
  { id: 'bukser', label: 'Bukser', href: '/shop/bukser-jeans?sub=bukser' },
  { id: 'skjorter', label: 'Skjorter', href: '/shop/overdeler?sub=skjorter' },
  {
    id: 'hettegenser',
    label: 'Hettegenser',
    href: '/shop/gensere?sub=hettegenser',
  },
  { id: 'genser', label: 'Genser', href: '/shop/gensere?sub=genser' },
  {
    id: 'vinterjakke',
    label: 'Vinterjakker',
    href: '/shop/jakker?sub=vinterjakke',
  },
  { id: 'sneakers', label: 'Sneakers', href: '/shop/sko?sub=sneakers' },
  { id: 'klokker', label: 'Klokker', href: '/shop/klokker' },
] as const;

export function shopQuickSuggestionsFor(
  suitableFor: SuitableFor,
): readonly ShopQuickSuggestion[] {
  return suitableFor === 'male'
    ? SHOP_QUICK_SUGGESTIONS_MALE
    : SHOP_QUICK_SUGGESTIONS_FEMALE;
}

/** Apply Dame/Herre to a suggestion href (Dame is the default — no param). */
export function shopQuickSuggestionHref(
  suggestion: ShopQuickSuggestion,
  suitableFor: SuitableFor,
): string {
  if (suitableFor !== 'male') return suggestion.href;
  const gender = shopGenderParamFor(suitableFor);
  return suggestion.href.includes('?')
    ? `${suggestion.href}&gender=${gender}`
    : `${suggestion.href}?gender=${gender}`;
}
