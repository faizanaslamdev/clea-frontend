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
    expect(getBrandEditorialPosition('Beredd NO')).toBe('50% 22%');
  });

  it('maps Beredd to the approved editorial asset', () => {
    expect(getBrandEditorialImage('Beredd NO')).toBe(
      '/brands/editorial/beredd.webp',
    );
  });

  it('keeps unknown affiliate imagery centered', () => {
    expect(getBrandEditorialImage('Other Store')).toBeNull();
    expect(getBrandEditorialPosition('Other Store')).toBe('50% 50%');
  });
});
