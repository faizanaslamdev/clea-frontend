import { describe, expect, it } from 'vitest';
import { prepareBrandGridBrands } from './BrandGrid';
import type { Store } from '@/lib/types';

function store(id: string, name: string, productCount: number): Store {
  return {
    id,
    name,
    country: 'Norway',
    currency: 'NOK',
    coverImage: `/api/${id}.jpg`,
    productCount,
  };
}

describe('prepareBrandGridBrands', () => {
  it('uses the supplied brand images while preserving order and routes', () => {
    const brands = prepareBrandGridBrands([
      store('outnorth', 'Outnorth NO', 65_196),
      store('384513', 'Ralph Lauren NO', 28_063),
      store('19563', 'Nelly NO', 14_403),
      store('19567', 'NLY Man NO', 8_276),
      store('336878', 'Viking Footwear', 3_588),
      store('109844', 'DB Journey NO', 407),
    ]);

    expect(brands.map((brand) => brand.name)).toEqual([
      'NLY Man NO',
      'Nelly NO',
      'Ralph Lauren',
      'DB Journey NO',
      'Outnorth NO',
      'Viking Footwear',
    ]);
    expect(brands.map((brand) => brand.coverImage)).toEqual([
      '/brands/editorial/nly-man.webp',
      '/brands/editorial/nelly.webp',
      '/brands/editorial/ralph-lauren.webp',
      '/brands/editorial/db-journey.webp',
      '/brands/editorial/outnorth.webp',
      '/brands/editorial/viking.webp',
    ]);

    const ralph = brands[2];
    expect(ralph?.href).toBe('/brands/ralph-lauren-no?m=384513');
    expect(brands.filter((brand) => brand.name === 'Ralph Lauren')).toHaveLength(
      1,
    );
  });

  it('keeps the affiliate-feed cover for an unmapped brand', () => {
    const [brand] = prepareBrandGridBrands([
      store('other', 'Another Store', 20),
    ]);

    expect(brand?.coverImage).toBe('/api/other.jpg');
  });
});
