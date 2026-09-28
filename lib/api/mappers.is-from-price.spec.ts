import { describe, expect, it } from 'vitest';
import { mapApiProductToProduct } from '@/lib/api/mappers';
import type { ApiProduct } from '@/lib/api/types';

function baseApi(overrides: Partial<ApiProduct> = {}): ApiProduct {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    aw_product_id: 'scrape:miinto:21f1b5eb-b1b7-4c9c-94e6-4a8e5adcef69',
    merchant_product_id: '21f1b5eb-b1b7-4c9c-94e6-4a8e5adcef69',
    name: 'Festkjoler',
    brand: 'malina',
    description: null,
    image_url: 'https://static.miinto.net/x.webp',
    category: 'Dresses',
    category_path: 'Dresses > Party',
    colour: null,
    size: null,
    suitable_for: null,
    product_type: null,
    condition: null,
    brand_id: null,
    data_feed_id: 'miinto-norway-nok',
    is_for_sale: null,
    alternate_images: null,
    price: 1929,
    old_price: null,
    currency: 'NOK',
    deep_link: 'https://www.miinto.no/p-x',
    merchant_name: 'Miinto',
    merchant_id: 'miinto',
    ean: null,
    mpn: '21f1b5eb-b1b7-4c9c-94e6-4a8e5adcef69',
    in_stock: true,
    last_updated: '2026-09-28T00:00:00.000Z',
    created_at: '2026-09-28T00:00:00.000Z',
    ...overrides,
  };
}

describe('mapApiProductToProduct isFromPrice', () => {
  it('maps is_from_price true', () => {
    const product = mapApiProductToProduct(
      baseApi({ is_from_price: true, price: 1929 }),
    );
    expect(product.isFromPrice).toBe(true);
    expect(product.lowestPrice).toBe(1929);
  });

  it('maps is_from_price false', () => {
    const product = mapApiProductToProduct(baseApi({ is_from_price: false }));
    expect(product.isFromPrice).toBe(false);
  });

  it('defaults missing is_from_price to false (older backends)', () => {
    const api = baseApi();
    delete api.is_from_price;
    const product = mapApiProductToProduct(api);
    expect(product.isFromPrice).toBe(false);
  });
});
