import { describe, expect, it } from 'vitest';
import {
  getProductImageFit,
  getProductImageFitClassName,
  isContainImageMerchant,
} from '@/lib/ui/product-image-fit';

describe('product-image-fit policy', () => {
  it('defaults unknown/missing merchants to cover', () => {
    expect(getProductImageFit(undefined)).toBe('cover');
    expect(getProductImageFit(null)).toBe('cover');
    expect(getProductImageFit({})).toBe('cover');
    expect(getProductImageFit({ merchantId: 'asos', merchantName: 'ASOS' })).toBe(
      'cover',
    );
    expect(
      getProductImageFit({ merchantId: 'miinto', merchantName: 'Miinto' }),
    ).toBe('cover');
    expect(getProductImageFit({ merchantName: 'Unknown Shop' })).toBe('cover');
  });

  it('uses contain for exception merchant IDs', () => {
    expect(getProductImageFit({ merchantId: '109844' })).toBe('contain');
    expect(getProductImageFit({ merchantId: '18620' })).toBe('contain');
    expect(getProductImageFit({ merchantId: 'kicks' })).toBe('contain');
    expect(getProductImageFit({ merchantId: '60821' })).toBe('contain');
    expect(getProductImageFit({ merchantId: '286201' })).toBe('contain');
  });

  it('uses contain for exception merchant name aliases when id is missing', () => {
    expect(getProductImageFit({ merchantName: 'DB Journey NO' })).toBe('contain');
    expect(getProductImageFit({ merchantName: 'Outnorth NO' })).toBe('contain');
    expect(getProductImageFit({ merchantName: 'KICKS' })).toBe('contain');
    expect(getProductImageFit({ merchantName: 'Sephora SE' })).toBe('contain');
    expect(getProductImageFit({ merchantName: 'Urverket' })).toBe('contain');
    expect(getProductImageFit({ merchantName: 'Urverket NO' })).toBe('contain');
  });

  it('prefers merchantId over a non-matching name', () => {
    expect(
      getProductImageFit({ merchantId: 'kicks', merchantName: 'ASOS' }),
    ).toBe('contain');
    expect(
      getProductImageFit({ merchantId: 'asos', merchantName: 'KICKS' }),
    ).toBe('cover');
  });

  it('does not treat brand-like substrings as exceptions', () => {
    expect(getProductImageFit({ merchantName: 'North Face Outlet' })).toBe(
      'cover',
    );
    expect(getProductImageFit({ merchantName: 'Journey Home' })).toBe('cover');
  });

  it('returns matching Tailwind class strings', () => {
    expect(getProductImageFitClassName({ merchantId: 'asos' })).toBe(
      'object-cover object-center',
    );
    expect(getProductImageFitClassName({ merchantId: 'kicks' })).toBe(
      'object-contain object-center',
    );
  });

  it('exposes isContainImageMerchant for callers', () => {
    expect(isContainImageMerchant({ merchantId: '60821' })).toBe(true);
    expect(isContainImageMerchant({ merchantId: 'asos' })).toBe(false);
  });
});
