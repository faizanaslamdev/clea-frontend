import { describe, expect, it } from 'vitest';
import { formatListingPrice, formatPrice } from '@/lib/domain/format';

/**
 * Mirrors product-detail-view primary price + purchase-line formatting.
 */
function formatDetailPrimaryPrice(
  price: number,
  currency: string,
  isFromPrice: boolean,
): string {
  return formatListingPrice(price, currency, { isFromPrice });
}

describe('product detail from-price display', () => {
  it('exact: primary and purchase line use plain formatPrice', () => {
    const primary = formatDetailPrimaryPrice(1929, 'NOK', false);
    const purchase = `Miinto · ${formatDetailPrimaryPrice(1929, 'NOK', false)}`;
    expect(primary).toBe(formatPrice(1929, 'NOK'));
    expect(purchase).toBe(`Miinto · ${formatPrice(1929, 'NOK')}`);
    expect(primary).not.toMatch(/^Fra /);
  });

  it('from: primary and purchase line use Fra prefix', () => {
    const primary = formatDetailPrimaryPrice(1929, 'NOK', true);
    const purchase = `Miinto · ${formatDetailPrimaryPrice(1929, 'NOK', true)}`;
    expect(primary).toBe(`Fra ${formatPrice(1929, 'NOK')}`);
    expect(purchase).toContain(`Fra ${formatPrice(1929, 'NOK')}`);
  });
});
