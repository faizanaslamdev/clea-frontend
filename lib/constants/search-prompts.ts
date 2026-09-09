import type { ShopCategory } from '@/lib/api/chat-types';

export const SEARCH_HEADLINE_EXAMPLES = [
  'antrekk fra jobb til middag',
  'lærveske til jobb, ikke stresskoffert',
  'fottøy til uformell bryllupsgjest',
  'old school joggesko',
  'americana-arbeidsklær',
] as const;

/**
 * Curated, hand-picked example search queries for the animated search-box
 * placeholder -- split by shopCategory so "Dame" and "Herre" each get
 * queries that actually make sense for that wardrobe. Deliberately NOT the
 * live AI-generated `suggestions` (useLandingSuggestions): those can vary
 * in phrasing/quality run to run, while a placeholder is a *promise* of
 * what the search can do, so it needs to reliably read well and point at
 * families/brands we know are genuinely well-stocked in the catalog
 * (matches lib/constants/category-grid.ts's families and the merchants
 * confirmed live in lib/image-hosts.mjs, e.g. Ralph Lauren, Outnorth).
 */
export const SEARCH_PLACEHOLDER_EXAMPLES: Record<ShopCategory, readonly string[]> = {
  womens: [
    'Bryllupsgjest-kjole til en sommerfest',
    'Ferieklare sandaler til sommeren',
    'Strikkegenser i myk ull til høsten',
    'Sort skinnjakke i mellomstørrelse',
    'En veske som passer til alt',
  ],
  mens: [
    'Vinterjakke til herre under 1500 kr',
    'Alt fra Ralph Lauren, på tvers av butikker',
    'Joggesko til hverdagsbruk',
    'Ullgenser til kontordagen',
    'Chinos som funker til jobb og fest',
  ],
} as const;
