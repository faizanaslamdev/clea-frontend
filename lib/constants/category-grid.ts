import type { ProductFamily, SuitableFor } from '@/lib/api/chat-types';

/** Apparel ontology family, or a non-family shop shelf (Beauty / Accessories). */
export type CategoryShelf = ProductFamily | 'beauty' | 'accessories';

export interface CategoryGridEntry {
  /**
   * Stable React / preview key. Required when the same shelf appears twice
   * with different labels (e.g. T-skjorter + Skjorter both use `tops`).
   */
  id: string;
  /** Matching / gap-fill key — ProductFamily or beauty/accessories shelf. */
  shelf: CategoryShelf;
  /**
   * Optional catalog `product_family` for apparel gap-fills. Omitted for
   * beauty/accessories (those use `q` + segment=all instead).
   */
  family?: ProductFamily;
  /** Customer-facing Norwegian label shown on the tile. */
  label: string;
  /** Chat query fired when the tile is clicked. */
  query: string;
  /**
   * Optional catalog `q` used only when fetching tile preview photos.
   * Keeps chat entry copy (`query`) natural while steering image picks
   * toward representative products (e.g. real knit sweaters, not tanks).
   */
  previewQ?: string;
  /**
   * Optional brand filter for tile photos only — steers outdoor-heavy
   * families toward fashion CDNs (e.g. Nelly) without changing chat copy.
   */
  previewBrand?: string;
  /** Card background gradient — from (top-left) → to (bottom-right). */
  accentFrom: string;
  accentTo: string;
}

function apparel(
  partial: Omit<CategoryGridEntry, 'shelf' | 'family'> & { family: ProductFamily },
): CategoryGridEntry {
  return { ...partial, shelf: partial.family, family: partial.family };
}

/**
 * Homepage "Hva leter du etter?" carousel — fixed at 8 cards (Zabi), each with
 * a browse destination under `/shop/[category]`. /shop uses the Dame/Herre
 * lists via `categoryGridForShop` (same count).
 */
export const CATEGORY_GRID_ENTRIES: readonly CategoryGridEntry[] = [
  apparel({
    id: 'jeans-bukser',
    family: 'bottoms',
    label: 'Jeans & bukser',
    query: 'Vis meg jeans og bukser',
    previewQ: 'jeans',
    previewBrand: 'nelly',
    accentFrom: '#a4883f',
    accentTo: '#584a20',
  }),
  apparel({
    id: 'dresses',
    family: 'dresses',
    label: 'Kjoler',
    query: 'Vis meg kjoler',
    previewQ: 'kjole',
    accentFrom: '#7d5468',
    accentTo: '#432934',
  }),
  apparel({
    id: 'tees',
    family: 'tops',
    label: 'T-skjorter',
    query: 'Vis meg t-skjorter',
    previewQ: 't-shirt',
    previewBrand: 'nelly',
    accentFrom: '#3d5068',
    accentTo: '#1f2938',
  }),
  apparel({
    id: 'tops',
    family: 'tops',
    label: 'Topper',
    query: 'Vis meg topper',
    previewQ: 'top',
    previewBrand: 'nelly',
    accentFrom: '#436384',
    accentTo: '#22303f',
  }),
  apparel({
    id: 'knitwear',
    family: 'knitwear',
    label: 'Gensere & strikk',
    query: 'Vis meg gensere og strikk',
    previewQ: 'genser',
    previewBrand: 'nelly',
    accentFrom: '#b06a45',
    accentTo: '#5f3826',
  }),
  apparel({
    id: 'outerwear',
    family: 'outerwear',
    label: 'Ytterjakker',
    query: 'Vis meg ytterjakker',
    previewQ: 'jakke',
    accentFrom: '#3c3f45',
    accentTo: '#1c1e21',
  }),
  apparel({
    id: 'footwear',
    family: 'footwear',
    label: 'Sko',
    query: 'Vis meg sko',
    previewQ: 'sko',
    previewBrand: 'nelly',
    accentFrom: '#2f6b64',
    accentTo: '#163531',
  }),
  apparel({
    id: 'bags',
    family: 'bags',
    label: 'Vesker',
    query: 'Vis meg vesker',
    previewQ: 'veske',
    accentFrom: '#52606d',
    accentTo: '#29303a',
  }),
] as const;

/** Homepage + shop fan-card count — keep in sync with the curated lists below. */
export const CATEGORY_SECTION_CARD_COUNT = 8;

/**
 * /shop only — curated Dame/Herre shelves (not the full ontology).
 *
 * Equal length so the grid never reflows on gender toggle. Slot contents can
 * differ by audience where catalog coverage differs (e.g. Kjoler for Dame,
 * Sokker for Herre). Always `CATEGORY_SECTION_CARD_COUNT` cards.
 */
export const SHOP_CATEGORY_GRID_FEMALE: readonly CategoryGridEntry[] = [
  apparel({
    id: 'jeans-bukser',
    family: 'bottoms',
    label: 'Jeans & bukser',
    query: 'Vis meg jeans og bukser',
    previewQ: 'jeans',
    previewBrand: 'nelly',
    accentFrom: '#a4883f',
    accentTo: '#584a20',
  }),
  apparel({
    id: 'dresses',
    family: 'dresses',
    label: 'Kjoler',
    query: 'Vis meg kjoler',
    previewQ: 'kjole',
    accentFrom: '#7d5468',
    accentTo: '#432934',
  }),
  apparel({
    id: 'tees',
    family: 'tops',
    label: 'T-skjorter',
    query: 'Vis meg t-skjorter',
    previewQ: 't-shirt',
    previewBrand: 'nelly',
    accentFrom: '#3d5068',
    accentTo: '#1f2938',
  }),
  apparel({
    id: 'tops',
    family: 'tops',
    label: 'Topper',
    query: 'Vis meg topper',
    previewQ: 'top',
    previewBrand: 'nelly',
    accentFrom: '#436384',
    accentTo: '#22303f',
  }),
  apparel({
    id: 'outerwear',
    family: 'outerwear',
    label: 'Jakker',
    query: 'Vis meg jakker',
    previewQ: 'jakke',
    accentFrom: '#3c3f45',
    accentTo: '#1c1e21',
  }),
  apparel({
    id: 'footwear',
    family: 'footwear',
    label: 'Sko',
    query: 'Vis meg sko',
    previewQ: 'sko',
    previewBrand: 'nelly',
    accentFrom: '#2f6b64',
    accentTo: '#163531',
  }),
  apparel({
    id: 'knitwear',
    family: 'knitwear',
    label: 'Genser & strikk',
    query: 'Vis meg gensere og strikk',
    previewQ: 'genser',
    previewBrand: 'nelly',
    accentFrom: '#b06a45',
    accentTo: '#5f3826',
  }),
  apparel({
    id: 'bags',
    family: 'bags',
    label: 'Vesker',
    query: 'Vis meg vesker',
    previewQ: 'veske',
    accentFrom: '#52606d',
    accentTo: '#29303a',
  }),
];

/** Herre /shop — same count/order as Dame so the grid never reflows. */
export const SHOP_CATEGORY_GRID_MALE: readonly CategoryGridEntry[] = [
  apparel({
    id: 'jeans-bukser',
    family: 'bottoms',
    label: 'Jeans & bukser',
    query: 'Vis meg jeans og bukser',
    previewQ: 'jeans',
    accentFrom: '#a4883f',
    accentTo: '#584a20',
  }),
  apparel({
    id: 'socks',
    family: 'socks',
    label: 'Sokker',
    query: 'Vis meg sokker',
    previewQ: 'sokker',
    accentFrom: '#5a6b7c',
    accentTo: '#2c3640',
  }),
  apparel({
    id: 'tees',
    family: 'tops',
    label: 'T-skjorter',
    query: 'Vis meg t-skjorter',
    previewQ: 't-shirt',
    accentFrom: '#3d5068',
    accentTo: '#1f2938',
  }),
  apparel({
    id: 'tops',
    family: 'tops',
    label: 'Topper',
    query: 'Vis meg topper',
    previewQ: 'hoodie',
    accentFrom: '#436384',
    accentTo: '#22303f',
  }),
  apparel({
    id: 'outerwear',
    family: 'outerwear',
    label: 'Jakker',
    query: 'Vis meg jakker',
    previewQ: 'jakke',
    accentFrom: '#3c3f45',
    accentTo: '#1c1e21',
  }),
  apparel({
    id: 'footwear',
    family: 'footwear',
    label: 'Sko',
    query: 'Vis meg sko',
    previewQ: 'sko',
    accentFrom: '#2f6b64',
    accentTo: '#163531',
  }),
  apparel({
    id: 'knitwear',
    family: 'knitwear',
    label: 'Genser & strikk',
    query: 'Vis meg gensere og strikk',
    previewQ: 'genser',
    accentFrom: '#b06a45',
    accentTo: '#5f3826',
  }),
  apparel({
    id: 'bags',
    family: 'bags',
    label: 'Vesker',
    query: 'Vis meg vesker',
    previewQ: 'veske',
    accentFrom: '#52606d',
    accentTo: '#29303a',
  }),
];

if (CATEGORY_GRID_ENTRIES.length !== CATEGORY_SECTION_CARD_COUNT) {
  throw new Error(
    `Homepage category grid must have ${CATEGORY_SECTION_CARD_COUNT} cards (got ${CATEGORY_GRID_ENTRIES.length})`,
  );
}

if (SHOP_CATEGORY_GRID_FEMALE.length !== SHOP_CATEGORY_GRID_MALE.length) {
  throw new Error(
    `Shop category grids must match length (female ${SHOP_CATEGORY_GRID_FEMALE.length} vs male ${SHOP_CATEGORY_GRID_MALE.length})`,
  );
}

if (SHOP_CATEGORY_GRID_FEMALE.length !== CATEGORY_SECTION_CARD_COUNT) {
  throw new Error(
    `Shop category grids must have ${CATEGORY_SECTION_CARD_COUNT} cards (got ${SHOP_CATEGORY_GRID_FEMALE.length})`,
  );
}

/** Fixed card/chip count for Dame and Herre on /shop. */
export const SHOP_CATEGORY_GRID_COUNT = SHOP_CATEGORY_GRID_FEMALE.length;

/** Shop Dame/Herre grids — equal length so the carousel never reflows. */
export function categoryGridForShop(
  suitableFor: SuitableFor,
): readonly CategoryGridEntry[] {
  return suitableFor === 'male'
    ? SHOP_CATEGORY_GRID_MALE
    : SHOP_CATEGORY_GRID_FEMALE;
}
