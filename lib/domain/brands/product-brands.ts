import { cache } from 'react';
import { fetchCatalogBrands, type CatalogBrowseBrand } from '@/lib/api/products';
import { slugifyBrandName } from '@/lib/domain/stores/slug';

/** Brand landing pages exist for the catalogue's biggest brands. */
export const BRAND_PAGE_LIMIT = 500;
export const BRAND_LOOKUP_LIMIT = 2000;
const BRANDS_REVALIDATE_SECONDS = 86400;

export interface ProductBrand {
  /** Value the catalogue filters on (as stored, usually lower case). */
  value: string;
  /** Name shown on the page. */
  name: string;
  slug: string;
  productCount: number;
}

/** Official spellings that simple title case gets wrong. */
const DISPLAY_OVERRIDES: Record<string, string> = {
  adidas: 'adidas',
  'adidas originals': 'adidas Originals',
  'asos design': 'ASOS DESIGN',
  asos: 'ASOS',
  'h&m': 'H&M',
  rrl: 'RRL',
  boss: 'BOSS',
  only: 'ONLY',
  'carhartt wip': 'Carhartt WIP',
  'dkny': 'DKNY',
  'mac': 'MAC',
  'nly man': 'NLY Man',
  'nly trend': 'NLY Trend',
  'by malene birger': 'By Malene Birger',
  'acne studios': 'Acne Studios',
  'new balance': 'New Balance',
  'the north face': 'The North Face',
};

export function displayBrandName(value: string): string {
  const trimmed = value.trim();
  const override = DISPLAY_OVERRIDES[trimmed.toLowerCase()];
  if (override) return override;
  if (trimmed !== trimmed.toLowerCase()) return trimmed; // already cased by the store
  return trimmed
    .split(/(\s+|-)/)
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
    .join('');
}

function toProductBrand(entry: CatalogBrowseBrand): ProductBrand {
  return {
    value: entry.brand,
    name: displayBrandName(entry.brand),
    slug: slugifyBrandName(entry.brand),
    productCount: entry.productCount,
  };
}

/** Largest brands first; cached for a day (the list changes slowly). */
export const getProductBrands = cache(async (): Promise<ProductBrand[]> => {
  const entries = await fetchCatalogBrands(BRAND_PAGE_LIMIT, {
    next: { revalidate: BRANDS_REVALIDATE_SECONDS },
  });
  const seen = new Set<string>();
  const brands: ProductBrand[] = [];
  for (const entry of entries) {
    const brand = toProductBrand(entry);
    if (!brand.slug || seen.has(brand.slug)) continue;
    seen.add(brand.slug);
    brands.push(brand);
  }
  return brands;
});

/** Every brand with products, for slug lookups (the A–Å list shows the top 500). */
const getAllProductBrands = cache(async (): Promise<ProductBrand[]> => {
  const entries = await fetchCatalogBrands(BRAND_LOOKUP_LIMIT, {
    next: { revalidate: BRANDS_REVALIDATE_SECONDS },
  });
  return entries.map(toProductBrand);
});

export async function findProductBrand(slug: string): Promise<ProductBrand | undefined> {
  const brands = await getProductBrands();
  const listed = brands.find((brand) => brand.slug === slug);
  if (listed) return listed;
  // Brands just outside the top 500 (counts move with every feed import)
  // used to 404 — and that 404 was then cached for 15 minutes.
  const all = await getAllProductBrands().catch(() => []);
  return all.find((brand) => brand.slug === slug);
}

/** Link to a brand page when that brand has one. */
export async function productBrandHref(brandValue: string | null | undefined): Promise<string | undefined> {
  if (!brandValue?.trim()) return undefined;
  const slug = slugifyBrandName(brandValue);
  const brand = await findProductBrand(slug).catch(() => undefined);
  return brand ? `/merker/${brand.slug}` : undefined;
}
