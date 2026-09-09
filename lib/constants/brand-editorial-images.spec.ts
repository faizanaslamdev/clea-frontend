import { describe, expect, it } from 'vitest';
import {
  getBrandEditorialImage,
  getBrandEditorialPosition,
} from './brand-editorial-images';

describe('brand editorial image presentation', () => {
  it('uses face-aware focal points for approved portrait imagery', () => {
    expect(getBrandEditorialPosition('NLY Man NO')).toBe('50% 22%');
    expect(getBrandEditorialPosition('Nelly NO')).toBe('50% 18%');
    expect(getBrandEditorialPosition('DB Journey NO')).toBe('70% 24%');
    expect(getBrandEditorialPosition('Outnorth NO')).toBe('50% 28%');
    expect(getBrandEditorialPosition('Viking Footwear')).toBe('50% 20%');
    expect(getBrandEditorialPosition('Ralph Lauren NO')).toBe('50% 18%');
    expect(getBrandEditorialPosition('adidas NO')).toBe('50% 35%');
    expect(getBrandEditorialPosition('Papique NO')).toBe('50% 45%');
    expect(getBrandEditorialPosition('Urverket')).toBe('50% 40%');
  });

  it('maps adidas to the approved editorial asset', () => {
    expect(getBrandEditorialImage('adidas NO')).toBe(
      '/brands/editorial/adidas.webp',
    );
  });

  it('maps Papique NO, Urverket, and Sephora SE to approved editorial assets', () => {
    expect(getBrandEditorialImage('Papique NO')).toBe(
      '/brands/editorial/papique.webp',
    );
    expect(getBrandEditorialImage('Urverket')).toBe(
      '/brands/editorial/urverket.webp',
    );
    expect(getBrandEditorialImage('Sephora SE')).toBe(
      '/brands/editorial/sephora.webp',
    );
  });

  it('does not map ended Beredd partnership to editorial assets', () => {
    expect(getBrandEditorialImage('Beredd NO')).toBeNull();
  });

  it('keeps unknown affiliate imagery centered', () => {
    expect(getBrandEditorialImage('Other Store')).toBeNull();
    expect(getBrandEditorialPosition('Other Store')).toBe('50% 50%');
  });
});
