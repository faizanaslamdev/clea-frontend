import type { ProductFamily } from '@/lib/api/chat-types';

export interface CategoryGridEntry {
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
  /** Card background gradient — from (top-left) → to (bottom-right). */
  accentFrom: string;
  accentTo: string;
}

/**
 * Homepage "shop by category" carousel — a small fanned photo stack per
 * family on a distinct tinted gradient card (studied from daydream.ing's
 * "What are you shopping for?" section). Fetched live so the tile photos
 * reflect real current inventory.
 *
 * `sleeping_bags` is the one ProductFamily left out on purpose: a live
 * catalog check (GET /catalog?product_family=sleeping_bags) returned 0
 * products, so it would render an empty/dropped tile -- not just a "niche"
 * call. The others (including socks/legwear/gloves, added after the same
 * check turned up hundreds to 1000+ real products each) are all backed by
 * genuine current inventory.
 */
export const CATEGORY_GRID_ENTRIES: readonly CategoryGridEntry[] = [
  {
    family: 'dresses',
    label: 'Kjoler',
    query: 'Vis meg kjoler',
    accentFrom: '#7d5468',
    accentTo: '#432934',
  },
  {
    family: 'tops',
    label: 'Topper',
    query: 'Vis meg topper',
    accentFrom: '#3d5068',
    accentTo: '#1f2938',
  },
  {
    family: 'knitwear',
    label: 'Strikk',
    query: 'Vis meg strikkegensere',
    previewQ: 'strikkegenser',
    accentFrom: '#b06a45',
    accentTo: '#5f3826',
  },
  {
    family: 'bottoms',
    label: 'Bukser & nederdeler',
    query: 'Vis meg bukser og nederdeler',
    previewQ: 'bukser',
    accentFrom: '#a4883f',
    accentTo: '#584a20',
  },
  {
    family: 'outerwear',
    label: 'Ytterjakker',
    query: 'Vis meg skinnjakke',
    previewQ: 'skinnjakke',
    accentFrom: '#3c3f45',
    accentTo: '#1c1e21',
  },
  {
    family: 'underwear',
    label: 'Undertøy & BH',
    query: 'Vis meg undertøy og BH',
    previewQ: 'wire bra',
    accentFrom: '#8a4f6d',
    accentTo: '#4a2a3a',
  },
  {
    family: 'footwear',
    label: 'Sko',
    query: 'Vis meg sko',
    previewQ: 'sko',
    accentFrom: '#3f5b48',
    accentTo: '#1f3126',
  },
  {
    family: 'bags',
    label: 'Vesker',
    query: 'Vis meg vesker',
    accentFrom: '#436384',
    accentTo: '#22303f',
  },
  {
    family: 'gloves',
    label: 'Hansker',
    query: 'Vis meg hansker',
    accentFrom: '#52606d',
    accentTo: '#29303a',
  },
  {
    family: 'socks',
    label: 'Sokker',
    query: 'Vis meg sokker',
    accentFrom: '#2f6b64',
    accentTo: '#163531',
  },
  {
    family: 'legwear',
    label: 'Strømpebukser',
    query: 'Vis meg strømpebukser',
    accentFrom: '#5c4470',
    accentTo: '#2e2138',
  },
] as const;
