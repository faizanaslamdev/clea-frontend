import { describe, expect, it } from 'vitest';
import {
  getBrandEditorialImage,
  getBrandEditorialObjectFit,
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
    expect(getBrandEditorialPosition('KICKS')).toBe('50% 32%');
    expect(getBrandEditorialPosition('Miinto')).toBe('50% 42%');
    expect(getBrandEditorialPosition('Urverket')).toBe('50% 40%');
    expect(getBrandEditorialPosition('Sephora SE')).toBe('50% 35%');
  });

  it('uses object-contain only for still-life / packshot brand covers', () => {
    expect(getBrandEditorialObjectFit('DB Journey NO')).toBe('contain');
    expect(getBrandEditorialObjectFit('Outnorth NO')).toBe('contain');
    expect(getBrandEditorialObjectFit('KICKS')).toBe('contain');
    expect(getBrandEditorialObjectFit('Sephora SE')).toBe('contain');
    expect(getBrandEditorialObjectFit('Urverket')).toBe('contain');
    expect(getBrandEditorialObjectFit('ASOS')).toBe('cover');
    expect(getBrandEditorialObjectFit('H&M')).toBe('cover');
    expect(getBrandEditorialObjectFit('Nelly NO')).toBe('cover');
    expect(getBrandEditorialObjectFit('Miinto')).toBe('cover');
    expect(getBrandEditorialObjectFit('adidas NO')).toBe('cover');
  });

  it('maps adidas to the approved editorial asset', () => {
    expect(getBrandEditorialImage('adidas NO')).toBe(
      '/brands/editorial/adidas.webp',
    );
  });

  it('maps ASOS, Bubbleroom, Ellos, H&M, KICKS, Miinto, Urverket, and Sephora SE to approved editorial assets', () => {
    expect(getBrandEditorialImage('ASOS')).toBe('/brands/editorial/asos.webp');
    expect(getBrandEditorialImage('Bubbleroom')).toBe(
      '/brands/editorial/bubbleroom.webp',
    );
    expect(getBrandEditorialImage('Ellos')).toBe(
      '/brands/editorial/ellos.webp',
    );
    expect(getBrandEditorialImage('Ellos NO')).toBe(
      '/brands/editorial/ellos.webp',
    );
    expect(getBrandEditorialImage('H&M')).toBe('/brands/editorial/hm.webp');
    expect(getBrandEditorialImage('hm')).toBe('/brands/editorial/hm.webp');
    expect(getBrandEditorialImage('KICKS')).toBe(
      '/brands/editorial/kicks.webp',
    );
    expect(getBrandEditorialImage('Kicks')).toBe(
      '/brands/editorial/kicks.webp',
    );
    expect(getBrandEditorialImage('Miinto')).toBe(
      '/brands/editorial/miinto.webp',
    );
    expect(getBrandEditorialImage('Miinto NO')).toBe(
      '/brands/editorial/miinto.webp',
    );
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
    expect(getBrandEditorialObjectFit('Other Store')).toBe('cover');
  });
});
