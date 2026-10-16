import type { CatalogFacets } from '@/lib/api/products';
import type { ShopColourOption } from '@/lib/shop/shop-colours';
import type { Store } from '@/lib/types';

/** One checkbox row in the Shop filter drawer. */
export interface FacetOption {
  value: string;
  label: string;
  count: number;
  selected: boolean;
}

export interface ColourFacetOption extends FacetOption {
  swatch: string;
}

/**
 * Selected values always stay in the list (count 0 if the current filters
 * exclude them) so the shopper can untick them; everything else comes from
 * the facet response, which only contains values that have products.
 */
function withSelected(
  options: FacetOption[],
  selected: readonly string[],
  labelFor: (value: string) => string,
  sameValue: (a: string, b: string) => boolean = (a, b) => a === b,
): FacetOption[] {
  const missing = selected
    .filter((value) => !options.some((option) => sameValue(option.value, value)))
    .map((value) => ({ value, label: labelFor(value), count: 0, selected: true }));
  return [...missing, ...options];
}

export function storeFacetOptions(
  facets: CatalogFacets | undefined,
  selected: readonly string[],
  stores: readonly Store[],
): FacetOption[] {
  const names = new Map(stores.map((store) => [store.id, store.name]));
  const labelFor = (id: string) => names.get(id) ?? id;
  const options = (facets?.stores ?? []).map((entry) => ({
    value: entry.id,
    label: labelFor(entry.id),
    count: entry.count,
    selected: selected.includes(entry.id),
  }));
  options.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'nb'));
  return withSelected(options, selected, labelFor);
}

const sameBrand = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export function brandFacetOptions(
  facets: CatalogFacets | undefined,
  selected: readonly string[],
  query = '',
): FacetOption[] {
  const needle = query.trim().toLowerCase();
  const options = (facets?.brands ?? []).map((entry) => ({
    value: entry.brand,
    label: entry.brand,
    count: entry.count,
    selected: selected.some((value) => sameBrand(value, entry.brand)),
  }));
  const all = withSelected(options, selected, (value) => value, sameBrand);
  const filtered = needle
    ? all.filter((option) => option.label.toLowerCase().includes(needle))
    : all;
  // Selected first, then by count.
  return [...filtered].sort(
    (a, b) => Number(b.selected) - Number(a.selected) || b.count - a.count,
  );
}

/** Colours in the fixed palette order, only those present (or selected). */
export function colourFacetOptions(
  facets: CatalogFacets | undefined,
  selected: readonly string[],
  palette: readonly ShopColourOption[],
): ColourFacetOption[] {
  const counts = new Map((facets?.colours ?? []).map((entry) => [entry.value, entry.count]));
  return palette
    .filter((option) => counts.has(option.value) || selected.includes(option.value))
    .map((option) => ({
      value: option.value,
      label: option.label,
      swatch: option.swatch,
      count: counts.get(option.value) ?? 0,
      selected: selected.includes(option.value),
    }));
}
