import { afterEach, describe, expect, it } from 'vitest';
import {
  formatBudget,
  normaliseStyleProfile,
  readLocalStyleProfile,
  styleProfileForChat,
  writeLocalStyleProfile,
} from './style-profile';

describe('style profile (website)', () => {
  afterEach(() => window.localStorage.clear());

  it('cleans brands and drops unknown keys', () => {
    expect(
      normaliseStyleProfile({
        favouriteBrands: ['Arket', ' arket ', 'COS', 3],
        budgets: { outerwear: 4000, hats: 100, bags: 50 },
        sizes: { shoes: '38', socks: '40' },
      }),
    ).toEqual({ favouriteBrands: ['Arket', 'COS'], budgets: { outerwear: 4000 }, sizes: { shoes: '38' } });
  });

  it('sends nothing to the chat until there is a profile', () => {
    expect(styleProfileForChat()).toBeUndefined();
    writeLocalStyleProfile({ favouriteBrands: ['COS'], budgets: {}, sizes: {} });
    expect(readLocalStyleProfile().favouriteBrands).toEqual(['COS']);
    expect(styleProfileForChat()).toEqual({ favouriteBrands: ['COS'], budgets: {}, sizes: {} });
  });

  it('formats budgets in Norwegian', () => {
    expect(formatBudget(4000)).toBe('Opptil 4 000 kr');
    expect(formatBudget(undefined)).toBe('Ingen grense');
  });
});
