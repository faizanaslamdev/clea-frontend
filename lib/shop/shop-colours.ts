/**
 * Shop colour filter options. Values are the backend's stored colour families
 * (`colour_family`, see clea-backend `common/catalog/colour-family.ts`), so
 * "navy", "marineblå" and "collegiate navy" are all `blue`. Labels are
 * Norwegian; `swatch` is the dot shown next to the label.
 */

export interface ShopColourOption {
  /** Sent as `colour_families` / URL `farge`. */
  value: string;
  label: string;
  /** CSS background for the swatch dot. */
  swatch: string;
}

export const SHOP_COLOUR_OPTIONS: readonly ShopColourOption[] = [
  { value: 'black', label: 'Svart', swatch: '#111111' },
  { value: 'white', label: 'Hvit', swatch: '#ffffff' },
  { value: 'grey', label: 'Grå', swatch: '#9a9a9a' },
  { value: 'blue', label: 'Blå', swatch: '#2f5fb3' },
  { value: 'red', label: 'Rød', swatch: '#c62828' },
  { value: 'green', label: 'Grønn', swatch: '#3f7d3a' },
  { value: 'beige', label: 'Beige', swatch: '#d9c6a5' },
  { value: 'brown', label: 'Brun', swatch: '#7a4e2d' },
  { value: 'pink', label: 'Rosa', swatch: '#f2a7c3' },
  { value: 'yellow', label: 'Gul', swatch: '#f4cf3b' },
  { value: 'orange', label: 'Oransje', swatch: '#f08a24' },
  { value: 'purple', label: 'Lilla', swatch: '#7d4fa8' },
  { value: 'gold', label: 'Gull', swatch: 'linear-gradient(135deg, #f6e27a, #c79a2b)' },
  { value: 'silver', label: 'Sølv', swatch: 'linear-gradient(135deg, #f2f2f2, #a7a9ac)' },
  {
    value: 'multi',
    label: 'Flerfarget',
    swatch: 'conic-gradient(#c62828, #f4cf3b, #3f7d3a, #2f5fb3, #7d4fa8, #c62828)',
  },
] as const;

const BY_VALUE = new Map(
  SHOP_COLOUR_OPTIONS.map((entry) => [entry.value, entry]),
);

/** Accept known values only; ignore garbage / unknown URL params. */
export function parseShopColourParam(
  raw: string | null | undefined,
): string | undefined {
  if (raw == null) return undefined;
  const key = raw.trim().toLowerCase();
  return BY_VALUE.has(key) ? key : undefined;
}

export function shopColourOption(value: string): ShopColourOption | undefined {
  return BY_VALUE.get(value);
}

export function shopColourLabel(value: string): string | undefined {
  return BY_VALUE.get(value)?.label;
}
