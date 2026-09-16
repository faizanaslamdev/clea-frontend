/**
 * Curated Shop colour options aligned with backend `colourSearchPatterns`.
 *
 * Values are the English canonical keys the catalog API expects. Labels are
 * Norwegian for the Shop UI. We deliberately do not dump raw merchant colour
 * strings (adidas "core black / cloud white …") into the control.
 */

export interface ShopColourOption {
  /** Sent as `colour` / URL `farge`. */
  value: string;
  label: string;
}

/** Compact palette — enough for fashion discovery, not a swatch encyclopedia. */
export const SHOP_COLOUR_OPTIONS: readonly ShopColourOption[] = [
  { value: 'black', label: 'Svart' },
  { value: 'white', label: 'Hvit' },
  { value: 'blue', label: 'Blå' },
  { value: 'red', label: 'Rød' },
  { value: 'green', label: 'Grønn' },
  { value: 'grey', label: 'Grå' },
  { value: 'beige', label: 'Beige' },
  { value: 'brown', label: 'Brun' },
  { value: 'pink', label: 'Rosa' },
  { value: 'yellow', label: 'Gul' },
  { value: 'orange', label: 'Oransje' },
  { value: 'purple', label: 'Lilla' },
] as const;

const BY_VALUE = new Map(
  SHOP_COLOUR_OPTIONS.map((entry) => [entry.value, entry]),
);

/** Accept known canonical values; ignore garbage / unknown URL params. */
export function parseShopColourParam(
  raw: string | null | undefined,
): string | undefined {
  if (raw == null) return undefined;
  const key = raw.trim().toLowerCase();
  return BY_VALUE.has(key) ? key : undefined;
}

export function shopColourLabel(value: string): string | undefined {
  return BY_VALUE.get(value)?.label;
}
