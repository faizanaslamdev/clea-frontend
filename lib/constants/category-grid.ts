import type { ProductFamily } from '@/lib/api/chat-types';

export interface CategoryGridEntry {
  family: ProductFamily;
  /** Customer-facing Norwegian label shown on the tile. */
  label: string;
  /** Chat query fired when the tile is clicked. */
  query: string;
  /** Card background gradient — from (top-left) → to (bottom-right). */
  accentFrom: string;
  accentTo: string;
}

/**
 * Homepage "shop by category" carousel — a small fanned photo stack per
 * family on a distinct tinted gradient card (studied from daydream.ing's
 * "What are you shopping for?" section). Fetched live so the tile photos
 * reflect real current inventory. Limited to the broadest, most visually
 * strong families; niche ones (socks, legwear, gloves, sleeping_bags) are
 * left out of the homepage carousel.
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
    accentFrom: '#b06a45',
    accentTo: '#5f3826',
  },
  {
    family: 'bottoms',
    label: 'Bukser & nederdeler',
    query: 'Vis meg bukser og nederdeler',
    accentFrom: '#a4883f',
    accentTo: '#584a20',
  },
  {
    family: 'outerwear',
    label: 'Ytterjakker',
    query: 'Vis meg ytterjakker',
    accentFrom: '#3c3f45',
    accentTo: '#1c1e21',
  },
  {
    family: 'footwear',
    label: 'Sko',
    query: 'Vis meg sko',
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
] as const;
