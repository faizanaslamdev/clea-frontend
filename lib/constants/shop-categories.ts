/**
 * Browse taxonomy for `/shop/[category]`.
 *
 * Every `ontologyId` is a real node from the backend's `PRODUCT_ONTOLOGY_V1`.
 * The API expands each id to its descendants, so a category only needs the
 * branch it owns — `apparel.bottoms` also returns `apparel.bottoms.jeans`.
 *
 * This is a deliberately curated subset of the 53-node tree: it is a shopping
 * menu, not a mirror of the taxonomy. Slugs are ASCII so URLs stay clean.
 */

export interface ShopCategoryChild {
  slug: string;
  label: string;
  ontologyId: string;
}

export interface ShopCategory {
  slug: string;
  label: string;
  /** Sits under the H1 and in the meta description. */
  description: string;
  ontologyId: string;
  /**
   * Whether the Dame/Herre toggle applies. Beauty, watches and accessories
   * carry no `suitable_for` value in the catalog, so filtering them by gender
   * returns zero rows — the toggle is hidden and the filter omitted there.
   */
  gendered: boolean;
  children: readonly ShopCategoryChild[];
}

export const SHOP_CATEGORIES: readonly ShopCategory[] = [
  {
    slug: 'kjoler',
    label: 'Kjoler',
    description: 'Kjoler fra alle partnerbutikkene våre, med priser sammenlignet.',
    ontologyId: 'apparel.dresses',
    gendered: true,
    children: [],
  },
  {
    slug: 'overdeler',
    label: 'Overdeler',
    description: 'T-skjorter, skjorter og bluser på tvers av butikkene.',
    ontologyId: 'apparel.tops',
    gendered: true,
    children: [
      { slug: 't-skjorter', label: 'T-skjorter', ontologyId: 'apparel.tops.tshirt' },
      { slug: 'skjorter', label: 'Skjorter', ontologyId: 'apparel.tops.shirt' },
      { slug: 'bluser', label: 'Bluser', ontologyId: 'apparel.tops.blouse' },
    ],
  },
  {
    slug: 'gensere',
    label: 'Gensere & strikk',
    description: 'Gensere, cardigans og hettegensere — sammenlign før du kjøper.',
    ontologyId: 'apparel.knitwear',
    gendered: true,
    children: [
      { slug: 'genser', label: 'Genser', ontologyId: 'apparel.knitwear.sweater' },
      { slug: 'cardigan', label: 'Cardigan', ontologyId: 'apparel.knitwear.cardigan' },
      { slug: 'hettegenser', label: 'Hettegenser', ontologyId: 'apparel.knitwear.hoodie' },
    ],
  },
  {
    slug: 'bukser-jeans',
    label: 'Bukser & jeans',
    description: 'Jeans, bukser, shorts og skjørt fra alle butikkene.',
    ontologyId: 'apparel.bottoms',
    gendered: true,
    children: [
      { slug: 'jeans', label: 'Jeans', ontologyId: 'apparel.bottoms.jeans' },
      { slug: 'bukser', label: 'Bukser', ontologyId: 'apparel.bottoms.trousers' },
      { slug: 'shorts', label: 'Shorts', ontologyId: 'apparel.bottoms.shorts' },
      { slug: 'skjort', label: 'Skjørt', ontologyId: 'apparel.bottoms.skirt' },
      // Legwear is a sibling ontology branch, not under bottoms — exposed here
      // so Dame shoppers reach tights without a dedicated hub shelf or URL.
      { slug: 'tights', label: 'Tights', ontologyId: 'apparel.legwear' },
    ],
  },
  {
    slug: 'jakker',
    label: 'Jakker & yttertøy',
    description: 'Jakker, kåper, regnjakker og vinterjakker samlet ett sted.',
    ontologyId: 'apparel.outerwear',
    gendered: true,
    children: [
      { slug: 'jakke', label: 'Jakker', ontologyId: 'apparel.outerwear.jacket' },
      { slug: 'kape', label: 'Kåper & frakker', ontologyId: 'apparel.outerwear.coat' },
      { slug: 'regnjakke', label: 'Regnjakker', ontologyId: 'apparel.outerwear.rain_jacket' },
      { slug: 'vinterjakke', label: 'Vinterjakker', ontologyId: 'apparel.outerwear.winter_jacket' },
    ],
  },
  {
    slug: 'sko',
    label: 'Sko',
    description: 'Sneakers, støvler, sandaler og løpesko — pris sammenlignet.',
    ontologyId: 'apparel.footwear',
    gendered: true,
    children: [
      { slug: 'sneakers', label: 'Sneakers', ontologyId: 'apparel.footwear.sneakers' },
      { slug: 'stovler', label: 'Støvler', ontologyId: 'apparel.footwear.boots' },
      { slug: 'sandaler', label: 'Sandaler', ontologyId: 'apparel.footwear.sandals' },
      { slug: 'lopesko', label: 'Løpesko', ontologyId: 'apparel.footwear.running_shoes' },
    ],
  },
  {
    slug: 'vesker',
    label: 'Vesker',
    description: 'Håndvesker, ryggsekker, totes og crossbody-vesker.',
    ontologyId: 'apparel.bags',
    gendered: true,
    // Every bag child node is empty in the catalog; the parent carries them all.
    children: [],
  },
  {
    slug: 'sokker',
    label: 'Sokker',
    description: 'Sokker og ullsokker fra partnerbutikkene våre.',
    ontologyId: 'apparel.socks',
    gendered: true,
    children: [],
  },
  {
    slug: 'tights',
    label: 'Tights & leggings',
    description: 'Tights, leggings og treningstights på tvers av butikkene.',
    ontologyId: 'apparel.legwear',
    gendered: true,
    children: [],
  },
  {
    slug: 'skjonnhet',
    label: 'Skjønnhet',
    description: 'Sminke, parfyme, hudpleie og hårpleie — sammenlign prisene.',
    ontologyId: 'beauty',
    gendered: false,
    children: [
      { slug: 'sminke', label: 'Sminke', ontologyId: 'beauty.makeup' },
      { slug: 'parfyme', label: 'Parfyme', ontologyId: 'beauty.fragrance' },
      { slug: 'hudpleie', label: 'Hudpleie', ontologyId: 'beauty.skincare' },
      { slug: 'harpleie', label: 'Hårpleie', ontologyId: 'beauty.hair' },
      { slug: 'kroppspleie', label: 'Kroppspleie', ontologyId: 'beauty.body' },
    ],
  },
  {
    slug: 'klokker',
    label: 'Klokker',
    description: 'Klokker og armbåndsur fra partnerbutikkene våre.',
    ontologyId: 'watches',
    gendered: false,
    children: [],
  },
  {
    slug: 'tilbehor',
    label: 'Tilbehør',
    description: 'Smykker, belter og annet tilbehør.',
    ontologyId: 'accessories',
    gendered: false,
    children: [],
  },
] as const;

const BY_SLUG = new Map(SHOP_CATEGORIES.map((entry) => [entry.slug, entry]));

export function findShopCategory(slug: string): ShopCategory | undefined {
  return BY_SLUG.get(slug);
}

export function shopCategoryPath(slug: string): string {
  return `/shop/${slug}`;
}

export const SHOP_CATEGORY_SLUGS: readonly string[] = SHOP_CATEGORIES.map(
  (entry) => entry.slug,
);

/**
 * Maps a `CATEGORY_GRID_ENTRIES` tile id to its browse destination.
 *
 * Only tiles listed here navigate to the browse grid; anything omitted keeps
 * the previous chat-entry behaviour. `underwear` is deliberately absent — the
 * catalog has no products under `apparel.underwear` at any level, so a browse
 * page there would be an empty shelf.
 */
const GRID_ENTRY_BROWSE_HREF: Readonly<Record<string, string>> = {
  'jeans-bukser': '/shop/bukser-jeans',
  dresses: '/shop/kjoler',
  tops: '/shop/overdeler',
  tees: '/shop/overdeler?sub=t-skjorter',
  shirts: '/shop/overdeler?sub=skjorter',
  knitwear: '/shop/gensere',
  outerwear: '/shop/jakker',
  footwear: '/shop/sko',
  bags: '/shop/vesker',
  beauty: '/shop/skjonnhet',
  accessories: '/shop/tilbehor',
  socks: '/shop/sokker',
  watches: '/shop/klokker',
};

/** Where a category tile points, split so callers can compare it to page state. */
export interface ShopBrowseTarget {
  slug: string;
  sub?: string;
}

/** Browse target for a category tile, or undefined when it should open chat. */
export function shopBrowseTargetForGridEntry(
  entryId: string,
): ShopBrowseTarget | undefined {
  const href = GRID_ENTRY_BROWSE_HREF[entryId];
  if (!href) return undefined;

  const [path, query] = href.split('?');
  const slug = path.replace('/shop/', '');
  const sub = query ? new URLSearchParams(query).get('sub') : null;

  return sub ? { slug, sub } : { slug };
}

/** Browse href for a category tile, or undefined when it should open chat. */
export function shopBrowseHrefForGridEntry(
  entryId: string,
  gender?: 'male' | 'female' | 'unisex',
): string | undefined {
  const href = GRID_ENTRY_BROWSE_HREF[entryId];
  if (!href) return undefined;
  if (gender !== 'male') return href;
  return href.includes('?') ? `${href}&gender=herre` : `${href}?gender=herre`;
}
