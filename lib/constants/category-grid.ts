import type { ProductFamily, SuitableFor } from '@/lib/api/chat-types';

export interface CategoryGridEntry {
  /**
   * Stable React / preview key. Required when the same ProductFamily appears
   * twice with different labels (e.g. T-skjorter + Skjorter both use `tops`).
   */
  id: string;
  family: ProductFamily;
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

/**
 * Homepage "shop by category" carousel — mixed audience. Shop page uses
 * `categoryGridForShop` instead so Dame/Herre swap labels + photos while
 * keeping the same card count (Daydream Womens/Mens pattern).
 */
export const CATEGORY_GRID_ENTRIES: readonly CategoryGridEntry[] = [
  {
    id: 'dresses',
    family: 'dresses',
    label: 'Kjoler',
    query: 'Vis meg kjoler',
    previewQ: 'midi',
    accentFrom: '#7d5468',
    accentTo: '#432934',
  },
  {
    id: 'tops',
    family: 'tops',
    label: 'Topper',
    query: 'Vis meg topper',
    previewQ: 'bluse',
    previewBrand: 'nelly',
    accentFrom: '#3d5068',
    accentTo: '#1f2938',
  },
  {
    id: 'knitwear',
    family: 'knitwear',
    label: 'Strikk',
    query: 'Vis meg strikkegensere',
    previewQ: 'genser',
    previewBrand: 'nelly',
    accentFrom: '#b06a45',
    accentTo: '#5f3826',
  },
  {
    id: 'bottoms',
    family: 'bottoms',
    label: 'Bukser & nederdeler',
    query: 'Vis meg jeans',
    previewQ: 'jeans',
    previewBrand: 'nelly',
    accentFrom: '#a4883f',
    accentTo: '#584a20',
  },
  {
    id: 'outerwear',
    family: 'outerwear',
    label: 'Ytterjakker',
    query: 'Vis meg skinnjakke',
    previewQ: 'skinnjakke',
    accentFrom: '#3c3f45',
    accentTo: '#1c1e21',
  },
  {
    id: 'underwear',
    family: 'underwear',
    label: 'Undertøy & BH',
    query: 'Vis meg undertøy og BH',
    previewQ: 'wire bra',
    accentFrom: '#8a4f6d',
    accentTo: '#4a2a3a',
  },
  {
    id: 'footwear',
    family: 'footwear',
    label: 'Sko',
    query: 'Vis meg sandaler',
    previewQ: 'sandal',
    previewBrand: 'nelly',
    accentFrom: '#3f5b48',
    accentTo: '#1f3126',
  },
  {
    id: 'bags',
    family: 'bags',
    label: 'Vesker',
    query: 'Vis meg vesker',
    previewQ: 'veske',
    accentFrom: '#436384',
    accentTo: '#22303f',
  },
  {
    id: 'gloves',
    family: 'gloves',
    label: 'Hansker',
    query: 'Vis meg hansker',
    previewQ: 'skinn',
    accentFrom: '#52606d',
    accentTo: '#29303a',
  },
  {
    id: 'socks',
    family: 'socks',
    label: 'Sokker',
    query: 'Vis meg ullsokker',
    previewQ: 'ullsokker',
    accentFrom: '#2f6b64',
    accentTo: '#163531',
  },
  {
    id: 'legwear',
    family: 'legwear',
    label: 'Strømpebukser',
    query: 'Vis meg leggings',
    previewQ: 'leggings',
    accentFrom: '#5c4470',
    accentTo: '#2e2138',
  },
] as const;

/** Dame shop chips + "Hva leter du etter" — same length as male list.
 * Categories are chosen so a single Nelly merchant pool can fill all 11
 * tiles (no slow per-family gap fetches on /shop reload). */
export const SHOP_CATEGORY_GRID_FEMALE: readonly CategoryGridEntry[] = [
  {
    id: 'dresses',
    family: 'dresses',
    label: 'Kjoler',
    query: 'Vis meg kjoler',
    previewQ: 'kjole',
    accentFrom: '#7d5468',
    accentTo: '#432934',
  },
  {
    id: 'tops',
    family: 'tops',
    label: 'Topper',
    query: 'Vis meg topper',
    previewQ: 'top',
    accentFrom: '#3d5068',
    accentTo: '#1f2938',
  },
  {
    id: 'blouses',
    family: 'tops',
    label: 'Bluser',
    query: 'Vis meg bluser',
    previewQ: 'bluse',
    accentFrom: '#436384',
    accentTo: '#22303f',
  },
  {
    id: 'knitwear',
    family: 'knitwear',
    label: 'Strikk',
    query: 'Vis meg strikkegensere',
    previewQ: 'genser',
    accentFrom: '#b06a45',
    accentTo: '#5f3826',
  },
  {
    id: 'jeans',
    family: 'bottoms',
    label: 'Jeans',
    query: 'Vis meg jeans',
    previewQ: 'jeans',
    accentFrom: '#a4883f',
    accentTo: '#584a20',
  },
  {
    id: 'pants',
    family: 'bottoms',
    label: 'Bukser',
    query: 'Vis meg bukser',
    previewQ: 'bukse',
    accentFrom: '#3f5b48',
    accentTo: '#1f3126',
  },
  {
    id: 'skirts',
    family: 'bottoms',
    label: 'Skjørt',
    query: 'Vis meg skjørt',
    previewQ: 'skjørt',
    accentFrom: '#5c4470',
    accentTo: '#2e2138',
  },
  {
    id: 'outerwear',
    family: 'outerwear',
    label: 'Ytterjakker',
    query: 'Vis meg jakker',
    previewQ: 'jakke',
    accentFrom: '#3c3f45',
    accentTo: '#1c1e21',
  },
  {
    id: 'underwear',
    family: 'underwear',
    label: 'Undertøy & BH',
    query: 'Vis meg undertøy og BH',
    previewQ: 'bra',
    accentFrom: '#8a4f6d',
    accentTo: '#4a2a3a',
  },
  {
    id: 'footwear',
    family: 'footwear',
    label: 'Sko',
    query: 'Vis meg sko',
    previewQ: 'sko',
    accentFrom: '#2f6b64',
    accentTo: '#163531',
  },
  {
    id: 'sneakers',
    family: 'footwear',
    label: 'Sneakers',
    query: 'Vis meg sneakers',
    previewQ: 'sneaker',
    accentFrom: '#52606d',
    accentTo: '#29303a',
  },
] as const;

/**
 * Herre shop chips + cards — Daydream Mens pattern: same slot count as
 * Dame, filled from the NLY Man merchant pool so Dame/Herre swaps content
 * without adding/removing cards or firing 11 family catalog queries.
 */
export const SHOP_CATEGORY_GRID_MALE: readonly CategoryGridEntry[] = [
  {
    id: 'tees',
    family: 'tops',
    label: 'T-skjorter',
    query: 'Vis meg t-skjorter',
    previewQ: 't-shirt',
    accentFrom: '#3d5068',
    accentTo: '#1f2938',
  },
  {
    id: 'shirts',
    family: 'tops',
    label: 'Skjorter',
    query: 'Vis meg skjorter',
    previewQ: 'skjorte',
    accentFrom: '#b06a45',
    accentTo: '#5f3826',
  },
  {
    id: 'knitwear',
    family: 'knitwear',
    label: 'Gensere',
    query: 'Vis meg gensere',
    previewQ: 'genser',
    accentFrom: '#a4883f',
    accentTo: '#584a20',
  },
  {
    id: 'hoodies',
    family: 'knitwear',
    label: 'Hoodies',
    query: 'Vis meg hoodies',
    previewQ: 'hoodie',
    accentFrom: '#3c3f45',
    accentTo: '#1c1e21',
  },
  {
    id: 'pants',
    family: 'bottoms',
    label: 'Bukser',
    query: 'Vis meg bukser',
    previewQ: 'bukse',
    accentFrom: '#436384',
    accentTo: '#22303f',
  },
  {
    id: 'jeans',
    family: 'bottoms',
    label: 'Jeans',
    query: 'Vis meg jeans',
    previewQ: 'jeans',
    accentFrom: '#3f5b48',
    accentTo: '#1f3126',
  },
  {
    id: 'shorts',
    family: 'bottoms',
    label: 'Shorts',
    query: 'Vis meg shorts',
    previewQ: 'shorts',
    accentFrom: '#5c4470',
    accentTo: '#2e2138',
  },
  {
    id: 'outerwear',
    family: 'outerwear',
    label: 'Ytterjakker',
    query: 'Vis meg jakker',
    previewQ: 'jakke',
    accentFrom: '#52606d',
    accentTo: '#29303a',
  },
  {
    id: 'vests',
    family: 'outerwear',
    label: 'Vester',
    query: 'Vis meg vester',
    previewQ: 'vest',
    accentFrom: '#7d5468',
    accentTo: '#432934',
  },
  {
    id: 'footwear',
    family: 'footwear',
    label: 'Sko',
    query: 'Vis meg sko',
    previewQ: 'sko',
    accentFrom: '#2f6b64',
    accentTo: '#163531',
  },
  {
    id: 'sneakers',
    family: 'footwear',
    label: 'Sneakers',
    query: 'Vis meg sneakers',
    previewQ: 'sneaker',
    accentFrom: '#8a4f6d',
    accentTo: '#4a2a3a',
  },
] as const;

if (SHOP_CATEGORY_GRID_FEMALE.length !== SHOP_CATEGORY_GRID_MALE.length) {
  throw new Error(
    `Shop category grids must match length (female ${SHOP_CATEGORY_GRID_FEMALE.length} vs male ${SHOP_CATEGORY_GRID_MALE.length})`,
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
