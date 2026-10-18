import { describe, expect, it } from 'vitest';
import { normalizeAppPathname } from '@/lib/navigation/app-pathname';

describe('normalizeAppPathname', () => {
  it('maps the ISR root output path back to /', () => {
    expect(normalizeAppPathname('/index')).toBe('/');
  });

  it('leaves normal paths untouched', () => {
    expect(normalizeAppPathname('/')).toBe('/');
    expect(normalizeAppPathname('/shop')).toBe('/shop');
    expect(normalizeAppPathname('/brands/index')).toBe('/brands/index');
    expect(normalizeAppPathname('/brands/indexed')).toBe('/brands/indexed');
    expect(normalizeAppPathname('/product/index-1')).toBe('/product/index-1');
  });
});
