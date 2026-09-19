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

function shelfCard(
  partial: Omit<CategoryGridEntry, 'family'> & {
    shelf: 'beauty' | 'accessories';
  },
): CategoryGridEntry {
  return { ...partial };
}

/** Shared card definitions — reused by homepage and /shop where labels match. */
const CARDS = {
  jeansBukser: apparel({
    id: 'jeans-bukser',
    family: 'bottoms',
    label: 'Jeans & bukser',
    query: 'Vis meg jeans og bukser',
    previewQ: 'jeans',
    previewBrand: 'nelly',
    accentFrom: '#a4883f',
    accentTo: '#584a20',
  }),
  dresses: apparel({
    id: 'dresses',
    family: 'dresses',
    label: 'Kjoler',
    query: 'Vis meg kjoler',
    previewQ: 'kjole',
    accentFrom: '#7d5468',
    accentTo: '#432934',
  }),
  tees: apparel({
    id: 'tees',
    family: 'tops',
    label: 'T-skjorter',
    query: 'Vis meg t-skjorter',
    previewQ: 't-shirt',
    previewBrand: 'nelly',
    accentFrom: '#3d5068',
    accentTo: '#1f2938',
  }),
  tops: apparel({
    id: 'tops',
    family: 'tops',
    label: 'Topper',
    query: 'Vis meg topper',
    previewQ: 'top',
    previewBrand: 'nelly',
    accentFrom: '#436384',
    accentTo: '#22303f',
  }),
  /** Homepage label (plural «Gensere»). */
  knitwearHome: apparel({
    id: 'knitwear',
    family: 'knitwear',
    label: 'Gensere & strikk',
    query: 'Vis meg gensere og strikk',
    previewQ: 'genser',
    previewBrand: 'nelly',
    accentFrom: '#b06a45',
    accentTo: '#5f3826',
  }),
  /** Shop label (singular «Genser»). */
  knitwearShop: apparel({
    id: 'knitwear',
    family: 'knitwear',
    label: 'Genser & strikk',
    query: 'Vis meg gensere og strikk',
    previewQ: 'genser',
    previewBrand: 'nelly',
    accentFrom: '#b06a45',
    accentTo: '#5f3826',
  }),
  /** Homepage outerwear wording. */
  outerwearHome: apparel({
    id: 'outerwear',
    family: 'outerwear',
    label: 'Ytterjakker',
    query: 'Vis meg ytterjakker',
    previewQ: 'jakke',
    accentFrom: '#3c3f45',
    accentTo: '#1c1e21',
  }),
  /** Shop outerwear wording. */
  outerwearShop: apparel({
    id: 'outerwear',
    family: 'outerwear',
    label: 'Jakker',
    query: 'Vis meg jakker',
    previewQ: 'jakke',
    accentFrom: '#3c3f45',
    accentTo: '#1c1e21',
  }),
  footwear: apparel({
    id: 'footwear',
    family: 'footwear',
    label: 'Sko',
    query: 'Vis meg sko',
    previewQ: 'sko',
    previewBrand: 'nelly',
    accentFrom: '#2f6b64',
    accentTo: '#163531',
  }),
  bags: apparel({
    id: 'bags',
    family: 'bags',
    label: 'Vesker',
    query: 'Vis meg vesker',
    previewQ: 'veske',
    accentFrom: '#52606d',
    accentTo: '#29303a',
  }),
  shirts: apparel({
    id: 'shirts',
    family: 'tops',
    label: 'Skjorter',
    query: 'Vis meg skjorter',
    previewQ: 'skjorte',
    previewBrand: 'nelly',
    accentFrom: '#4a6a8a',
    accentTo: '#243548',
  }),
  underwear: apparel({
    id: 'underwear',
    family: 'underwear',
    label: 'Undertøy',
    query: 'Vis meg undertøy',
    previewQ: 'undertøy',
    previewBrand: 'nelly',
    accentFrom: '#8a6a78',
    accentTo: '#4a3542',
  }),
  beauty: shelfCard({
    id: 'beauty',
    shelf: 'beauty',
    label: 'Beauty',
    query: 'Vis meg beauty og skjønnhet',
    previewQ: 'sminke',
    accentFrom: '#9a5f7a',
    accentTo: '#52283c',
  }),
  accessories: shelfCard({
    id: 'accessories',
    shelf: 'accessories',
    label: 'Accessories',
    query: 'Vis meg accessories og tilbehør',
    previewQ: 'belte',
    accentFrom: '#6b5f4a',
    accentTo: '#342e22',
  }),
} as const;

/**
 * Homepage "Hva leter du etter?" carousel — curated 12 cards (not the Shop
 * hub list). Each apparel/beauty/accessories tile that has a Shop browse
 * destination links via {@link shopBrowseHrefForGridEntry}; Undertøy has no
 * `/shop` shelf yet, so that tile falls back to chat.
 */
export const CATEGORY_GRID_ENTRIES: readonly CategoryGridEntry[] = [
  CARDS.jeansBukser,
  CARDS.dresses,
  CARDS.tees,
  CARDS.tops,
  CARDS.knitwearHome,
  CARDS.outerwearHome,
  CARDS.footwear,
  CARDS.bags,
  CARDS.shirts,
  CARDS.underwear,
  CARDS.beauty,
  CARDS.accessories,
] as const;

export const HOMEPAGE_CATEGORY_CARD_COUNT = 12;

/**
 * /shop hub category cards — fixed 8-card list (same order for Dame and Herre
 * so the grid never reflows on gender toggle). Preview photos still filter by
 * audience via `suitableFor`.
 */
export const SHOP_CATEGORY_GRID: readonly CategoryGridEntry[] = [
  CARDS.jeansBukser,
  CARDS.tees,
  CARDS.tops,
  CARDS.outerwearShop,
  CARDS.footwear,
  CARDS.knitwearShop,
  CARDS.beauty,
  CARDS.bags,
] as const;

export const SHOP_CATEGORY_CARD_COUNT = 8;

/**
 * @deprecated Prefer {@link SHOP_CATEGORY_CARD_COUNT} or
 * {@link HOMEPAGE_CATEGORY_CARD_COUNT}. Kept as the Shop card count for older
 * callers that assumed one shared size.
 */
export const CATEGORY_SECTION_CARD_COUNT = SHOP_CATEGORY_CARD_COUNT;

/** Dame/Herre aliases — identical order/labels; photos differ by audience. */
export const SHOP_CATEGORY_GRID_FEMALE: readonly CategoryGridEntry[] =
  SHOP_CATEGORY_GRID;

export const SHOP_CATEGORY_GRID_MALE: readonly CategoryGridEntry[] =
  SHOP_CATEGORY_GRID;

if (CATEGORY_GRID_ENTRIES.length !== HOMEPAGE_CATEGORY_CARD_COUNT) {
  throw new Error(
    `Homepage category grid must have ${HOMEPAGE_CATEGORY_CARD_COUNT} cards (got ${CATEGORY_GRID_ENTRIES.length})`,
  );
}

if (SHOP_CATEGORY_GRID.length !== SHOP_CATEGORY_CARD_COUNT) {
  throw new Error(
    `Shop category grid must have ${SHOP_CATEGORY_CARD_COUNT} cards (got ${SHOP_CATEGORY_GRID.length})`,
  );
}

/** Fixed card/chip count for Dame and Herre on /shop. */
export const SHOP_CATEGORY_GRID_COUNT = SHOP_CATEGORY_GRID.length;

/** Shop Dame/Herre grids — equal length so the carousel never reflows. */
export function categoryGridForShop(
  _suitableFor: SuitableFor,
): readonly CategoryGridEntry[] {
  return SHOP_CATEGORY_GRID;
}
