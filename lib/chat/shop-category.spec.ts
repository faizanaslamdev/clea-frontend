import { describe, expect, it } from 'vitest';
import { parseShopCategory } from '@/lib/chat/shop-category';

describe('parseShopCategory', () => {
  it('accepts homepage gender tab values', () => {
    expect(parseShopCategory('mens')).toBe('mens');
    expect(parseShopCategory('womens')).toBe('womens');
  });

  it('rejects unknown values', () => {
    expect(parseShopCategory('kids')).toBeUndefined();
    expect(parseShopCategory(null)).toBeUndefined();
    expect(parseShopCategory('')).toBeUndefined();
  });
});
