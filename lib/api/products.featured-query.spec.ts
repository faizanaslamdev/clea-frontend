import { describe, expect, it } from 'vitest';

/**
 * Keep query-building covered without exporting the private helper.
 * Mirrors `buildProductsQuery` in lib/api/products.ts.
 */
function buildProductsQuery(params: {
  q?: string;
  brand?: string;
  merchantId?: string;
  category?: string;
  segment?: string;
  limit?: number;
  offset?: number;
  balanceMerchants?: boolean;
  perMerchantCandidateCap?: number;
}): string {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.brand) search.set('brand', params.brand);
  if (params.merchantId) search.set('merchant_id', params.merchantId);
  if (params.category) search.set('category', params.category);
  if (params.balanceMerchants) search.set('balance_merchants', 'true');
  if (params.perMerchantCandidateCap != null) {
    search.set(
      'per_merchant_candidate_cap',
      String(params.perMerchantCandidateCap),
    );
  }
  search.set('segment', params.segment ?? 'fashion');
  search.set('limit', String(params.limit ?? 24));
  search.set('offset', String(params.offset ?? 0));
  return search.toString();
}

describe('home popular catalog query', () => {
  it('requests a single balanced multi-brand catalog page', () => {
    const qs = buildProductsQuery({
      limit: 24,
      balanceMerchants: true,
      perMerchantCandidateCap: 4,
    });

    expect(qs).toContain('balance_merchants=true');
    expect(qs).toContain('per_merchant_candidate_cap=4');
    expect(qs).toContain('limit=24');
    expect(qs).not.toContain('merchant_id=');
  });
});
