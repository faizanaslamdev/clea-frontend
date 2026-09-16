/**
 * Catalog browse sort. Mirrors `CATALOG_SORT_VALUES` in the backend's
 * `catalog-listing.sql.ts` — the API rejects unknown values with a 400, so
 * these must stay in sync.
 */
export const CATALOG_SORT_VALUES = [
  'relevance',
  'price_asc',
  'price_desc',
] as const;

export type CatalogSort = (typeof CATALOG_SORT_VALUES)[number];

export const CATALOG_SORT_LABELS: Record<CatalogSort, string> = {
  relevance: 'Anbefalt',
  price_asc: 'Pris: lav til høy',
  price_desc: 'Pris: høy til lav',
};

export function parseCatalogSort(value: string | null | undefined): CatalogSort {
  return CATALOG_SORT_VALUES.includes(value as CatalogSort)
    ? (value as CatalogSort)
    : 'relevance';
}
