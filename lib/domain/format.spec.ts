import { describe, expect, it } from 'vitest';
import { formatListingPrice, formatPrice, toDisplayCase } from './format';

describe('toDisplayCase', () => {
  it('title-cases a fully shouting name', () => {
    expect(toDisplayCase('HETTEGENSER MED SKATEBOARDING-LOGO')).toBe(
      'Hettegenser Med Skateboarding-Logo',
    );
  });

  it('leaves mixed-case brand styling untouched', () => {
    expect(toDisplayCase('UGG M Classic Mini Boots & Støvler Brun')).toBe(
      'UGG M Classic Mini Boots & Støvler Brun',
    );
    expect(toDisplayCase("Nike Air Force 1 '07 Grå")).toBe("Nike Air Force 1 '07 Grå");
  });

  it('leaves already-clean names untouched', () => {
    expect(toDisplayCase('Only & Sons Onsceres Hoodie Sweat Noos Hoodies Svart')).toBe(
      'Only & Sons Onsceres Hoodie Sweat Noos Hoodies Svart',
    );
  });

  it('title-cases across slashes', () => {
    expect(toDisplayCase('CBLACK/AUON/CWHITE')).toBe('Cblack/Auon/Cwhite');
  });

  it('handles Norwegian letters', () => {
    expect(toDisplayCase('VÅRJAKKE MED HETTE')).toBe('Vårjakke Med Hette');
  });

  it('returns an empty string for null/undefined/blank input', () => {
    expect(toDisplayCase(null)).toBe('');
    expect(toDisplayCase(undefined)).toBe('');
    expect(toDisplayCase('   ')).toBe('');
  });
});

describe('formatListingPrice', () => {
  it('formats exact price without qualifier', () => {
    expect(formatListingPrice(1929, 'NOK')).toBe(formatPrice(1929, 'NOK'));
    expect(formatListingPrice(1929, 'NOK', { isFromPrice: false })).toBe(
      formatPrice(1929, 'NOK'),
    );
  });

  it('prefixes Norwegian Fra for from-price (default locale)', () => {
    expect(formatListingPrice(1929, 'NOK', { isFromPrice: true })).toBe(
      `Fra ${formatPrice(1929, 'NOK')}`,
    );
  });

  it('prefixes English From when locale is en', () => {
    expect(
      formatListingPrice(1929, 'NOK', { isFromPrice: true, locale: 'en' }),
    ).toBe(`From ${formatPrice(1929, 'NOK')}`);
  });
});
