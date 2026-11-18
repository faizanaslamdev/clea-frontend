import { apiFetch } from '@/lib/api/backend-client';

/**
 * Style profile add-on: favourite brands, what the shopper likes to spend per
 * category and their sizes. Saved on the account (POST /me/style-profile) and
 * kept in this browser, so every chat turn can send it as
 * `context.styleProfile` without waiting for the network.
 */

export const STYLE_BUDGET_ROWS = [
  { key: 'outerwear', label: 'Jakker og kåper' },
  { key: 'knitwear', label: 'Strikk' },
  { key: 'dresses', label: 'Kjoler' },
  { key: 'shoes', label: 'Sko' },
  { key: 'bags', label: 'Vesker' },
] as const;

export const STYLE_SIZE_ROWS = [
  { key: 'tops', label: 'Overdeler', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { key: 'dresses', label: 'Kjoler', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { key: 'jeans', label: 'Jeans', options: ['24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '36', '38'] },
  { key: 'shoes', label: 'Sko', options: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'] },
] as const;

export type StyleBudgetKey = (typeof STYLE_BUDGET_ROWS)[number]['key'];
export type StyleSizeKey = (typeof STYLE_SIZE_ROWS)[number]['key'];

export interface StyleProfile {
  favouriteBrands: string[];
  budgets: Partial<Record<StyleBudgetKey, number>>;
  sizes: Partial<Record<StyleSizeKey, string>>;
}

export const EMPTY_STYLE_PROFILE: StyleProfile = { favouriteBrands: [], budgets: {}, sizes: {} };

/** Slider range for budgets; the top step means "no limit". */
export const BUDGET_STEP = 100;
export const BUDGET_SLIDER_MAX = 10_000;

const STORAGE_KEY = 'clea-style-profile';

export function isEmptyStyleProfile(profile: StyleProfile | null | undefined): boolean {
  return (
    !profile ||
    (profile.favouriteBrands.length === 0 &&
      Object.keys(profile.budgets).length === 0 &&
      Object.keys(profile.sizes).length === 0)
  );
}

export function normaliseStyleProfile(raw: unknown): StyleProfile {
  if (!raw || typeof raw !== 'object') return { favouriteBrands: [], budgets: {}, sizes: {} };
  const value = raw as Record<string, unknown>;
  const seen = new Set<string>();
  const favouriteBrands = (Array.isArray(value.favouriteBrands) ? value.favouriteBrands : [])
    .filter((brand): brand is string => typeof brand === 'string')
    .map((brand) => brand.trim())
    .filter((brand) => {
      const key = brand.toLowerCase();
      if (!brand || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 30);
  const budgets: StyleProfile['budgets'] = {};
  const rawBudgets = (value.budgets ?? {}) as Record<string, unknown>;
  for (const { key } of STYLE_BUDGET_ROWS) {
    const amount = Number(rawBudgets[key]);
    if (Number.isFinite(amount) && amount >= BUDGET_STEP) budgets[key] = Math.round(amount);
  }
  const sizes: StyleProfile['sizes'] = {};
  const rawSizes = (value.sizes ?? {}) as Record<string, unknown>;
  for (const { key } of STYLE_SIZE_ROWS) {
    const size = rawSizes[key];
    if (typeof size === 'string' && size.trim()) sizes[key] = size.trim().slice(0, 12);
  }
  return { favouriteBrands, budgets, sizes };
}

/** The profile stored in this browser (empty when none or storage is blocked). */
export function readLocalStyleProfile(): StyleProfile {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normaliseStyleProfile(JSON.parse(raw)) : { ...EMPTY_STYLE_PROFILE };
  } catch {
    return { ...EMPTY_STYLE_PROFILE };
  }
}

export function writeLocalStyleProfile(profile: StyleProfile): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Private mode or blocked storage: the account copy still works.
  }
}

/** Signing out on a shared computer must not leave the profile behind. */
export function clearLocalStyleProfile(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored.
  }
}

/** For chat turns: the profile to send, or undefined when there is none. */
export function styleProfileForChat(): StyleProfile | undefined {
  if (typeof window === 'undefined') return undefined;
  const profile = readLocalStyleProfile();
  return isEmptyStyleProfile(profile) ? undefined : profile;
}

export async function fetchStyleProfile(): Promise<StyleProfile> {
  const data = await apiFetch<unknown>('/me/style-profile', { cache: 'no-store' });
  return normaliseStyleProfile(data);
}

export async function saveStyleProfile(profile: StyleProfile): Promise<StyleProfile> {
  const data = await apiFetch<unknown>('/me/style-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
    cache: 'no-store',
  });
  return normaliseStyleProfile(data);
}

export function formatBudget(amount: number | undefined): string {
  if (!amount) return 'Ingen grense';
  return `Opptil ${amount.toLocaleString('nb-NO').replace(/ /g, ' ')} kr`;
}
