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
    expect(getBrandEditorialPosition('ASOS')).toBe('50% 8%');
    expect(getBrandEditorialPosition('Bubbleroom')).toBe('50% 10%');
    expect(getBrandEditorialPosition('H&M')).toBe('50% 8%');
    expect(getBrandEditorialPosition('Urverket')).toBe('50% 40%');
    expect(getBrandEditorialPosition('Sephora SE')).toBe('50% 35%');
  });

  it('maps adidas to the approved editorial asset', () => {
    expect(getBrandEditorialImage('adidas NO')).toBe(
      '/brands/editorial/adidas.webp',
    );
  });

  it('maps ASOS, Bubbleroom, H&M, Urverket, and Sephora SE to approved editorial assets', () => {
    expect(getBrandEditorialImage('ASOS')).toBe('/brands/editorial/asos.webp');
    expect(getBrandEditorialImage('Bubbleroom')).toBe(
      '/brands/editorial/bubbleroom.webp',
    );
    expect(getBrandEditorialImage('H&M')).toBe('/brands/editorial/hm.webp');
    expect(getBrandEditorialImage('hm')).toBe('/brands/editorial/hm.webp');
    expect(getBrandEditorialImage('Urverket')).toBe(
      '/brands/editorial/urverket.webp',
    );
    expect(getBrandEditorialImage('Sephora SE')).toBe(
      '/brands/editorial/sephora.webp',
    );
  });

  it('does not map ended Beredd or Papique partnerships to editorial assets', () => {
    expect(getBrandEditorialImage('Beredd NO')).toBeNull();
    expect(getBrandEditorialImage('Papique NO')).toBeNull();
  });

  it('keeps unknown affiliate imagery centered', () => {
    expect(getBrandEditorialImage('Other Store')).toBeNull();
    expect(getBrandEditorialPosition('Other Store')).toBe('50% 50%');
  });
});
