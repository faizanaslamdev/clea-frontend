import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '@/lib/types';
import {
  CATEGORY_GRID_ENTRIES,
  type CategoryGridEntry,
} from '@/lib/constants/category-grid';
import {
  assignCategoryPreviewsFromPool,
  fetchCategoryPreviews,
  productMatchesShopEntry,
} from '@/lib/api/products';

function product(partial: {
  id: string;
  name: string;
  image: string;
  merchantId: string;
  merchantName: string;
  category?: Product['category'];
  productType?: string;
  categoryPath?: string;
}): Product {
  return {
    id: partial.id,
    name: partial.name,
    brand: partial.merchantName,
    category: partial.category ?? 'Fashion',
    image: partial.image,
    description: '',
    sku: partial.id,
    matchType: 'similar',
    rating: 0,
    reviewCount: 0,
    prices: { [partial.merchantId]: 100 },
    priceHistory: [],
    inStock: { [partial.merchantId]: true },
    lowestPrice: 100,
    highestPrice: 100,
    averagePrice: 100,
    savingsPercent: 0,
    trending: true,
    trendingScore: 1,
    merchantId: partial.merchantId,
    merchantName: partial.merchantName,
    productType: partial.productType,
    categoryPath: partial.categoryPath,
  };
}

/** Representative bulk pool covering all 12 homepage category tiles. */
function representativeHomepagePool(): Product[] {
  return [
    product({
      id: 'jeans-1',
      name: 'Straight Jeans Blue',
      image: 'https://cdn.example/jeans-1.jpg',
      merchantId: '19563',
      merchantName: 'Nelly NO',
      productType: 'Jeans',
    }),
    product({
      id: 'jeans-2',
      name: 'Wide Leg Bukse',
      image: 'https://cdn.example/jeans-2.jpg',
      merchantId: 'asos',
      merchantName: 'ASOS',
      productType: 'Pants',
    }),
    product({
      id: 'jeans-3',
      name: 'Mom Jeans Dark',
      image: 'https://cdn.example/jeans-3.jpg',
      merchantId: 'ellos',
      merchantName: 'Ellos',
      productType: 'Jeans',
    }),
    product({
      id: 'dress-1',
      name: 'Satin Kjole Champagne',
      image: 'https://cdn.example/dress-1.jpg',
      merchantId: '19563',
      merchantName: 'Nelly NO',
      productType: 'Dress',
    }),
    product({
      id: 'dress-2',
      name: 'Midi Dress Floral',
      image: 'https://cdn.example/dress-2.jpg',
      merchantId: 'bubbleroom',
      merchantName: 'Bubbleroom',
      productType: 'Dress',
    }),
    product({
      id: 'dress-3',
      name: 'Summer Kjole White',
      image: 'https://cdn.example/dress-3.jpg',
      merchantId: 'hm',
      merchantName: 'H&M',
      productType: 'Dress',
    }),
    product({
      id: 'tee-1',
      name: 'Classic Cotton T-shirt',
      image: 'https://cdn.example/tee-1.jpg',
      merchantId: 'asos',
      merchantName: 'ASOS',
      productType: 'T-shirt',
    }),
    product({
      id: 'tee-2',
      name: 'Oversized Tee Black',
      image: 'https://cdn.example/tee-2.jpg',
      merchantId: '19563',
      merchantName: 'Nelly NO',
      productType: 'T-shirt',
    }),
    product({
      id: 'tee-3',
      name: 'Basic T-shirt White',
      image: 'https://cdn.example/tee-3.jpg',
      merchantId: 'hm',
      merchantName: 'H&M',
      productType: 'T-shirt',
    }),
    product({
      id: 'top-1',
      name: 'Pleat Blouse Yellow',
      image: 'https://cdn.example/top-1.jpg',
      merchantId: '19563',
      merchantName: 'Nelly NO',
      productType: 'Blouse',
    }),
    product({
      id: 'top-2',
      name: 'Rib Top Cream',
      image: 'https://cdn.example/top-2.jpg',
      merchantId: 'ellos',
      merchantName: 'Ellos',
      productType: 'Top',
    }),
    product({
      id: 'top-3',
      name: 'Silk Blouse Navy',
      image: 'https://cdn.example/top-3.jpg',
      merchantId: 'bubbleroom',
      merchantName: 'Bubbleroom',
      productType: 'Blouse',
    }),
    product({
      id: 'knit-1',
      name: 'Chunky Genser Brown',
      image: 'https://cdn.example/knit-1.jpg',
      merchantId: '19563',
      merchantName: 'Nelly NO',
      productType: 'Sweater',
    }),
    product({
      id: 'knit-2',
      name: 'Crew Knit Sweater',
      image: 'https://cdn.example/knit-2.jpg',
      merchantId: 'asos',
      merchantName: 'ASOS',
      productType: 'Knitwear',
    }),
    product({
      id: 'knit-3',
      name: 'Cardigan Strikk Soft',
      image: 'https://cdn.example/knit-3.jpg',
      merchantId: 'hm',
      merchantName: 'H&M',
      productType: 'Cardigan',
    }),
    product({
      id: 'outer-1',
      name: 'Wool Jakke Black',
      image: 'https://cdn.example/outer-1.jpg',
      merchantId: 'asos',
      merchantName: 'ASOS',
      productType: 'Jacket',
    }),
    product({
      id: 'outer-2',
      name: 'Puffer Jacket Navy',
      image: 'https://cdn.example/outer-2.jpg',
      merchantId: 'ellos',
      merchantName: 'Ellos',
      productType: 'Jacket',
    }),
    product({
      id: 'outer-3',
      name: 'Trench Coat Beige',
      image: 'https://cdn.example/outer-3.jpg',
      merchantId: 'hm',
      merchantName: 'H&M',
      productType: 'Coat',
    }),
    product({
      id: 'shoe-1',
      name: 'Leather Sneaker White',
      image: 'https://cdn.example/shoe-1.jpg',
      merchantId: 'asos',
      merchantName: 'ASOS',
      productType: 'Sneakers',
      categoryPath: 'Sko',
    }),
    product({
      id: 'shoe-2',
      name: 'Summer Sandal Tan',
      image: 'https://cdn.example/shoe-2.jpg',
      merchantId: '19563',
      merchantName: 'Nelly NO',
      productType: 'Sandals',
    }),
    product({
      id: 'shoe-3',
      name: 'Ankle Boot Black',
      image: 'https://cdn.example/shoe-3.jpg',
      merchantId: 'ellos',
      merchantName: 'Ellos',
      productType: 'Boots',
    }),
    product({
      id: 'bag-1',
      name: 'Leather Veske Brown',
      image: 'https://cdn.example/bag-1.jpg',
      merchantId: '19563',
      merchantName: 'Nelly NO',
      productType: 'Bag',
    }),
    product({
      id: 'bag-2',
      name: 'Crossbody Bag Black',
      image: 'https://cdn.example/bag-2.jpg',
      merchantId: 'asos',
      merchantName: 'ASOS',
      productType: 'Bag',
    }),
    product({
      id: 'bag-3',
      name: 'Tote Veske Canvas',
      image: 'https://cdn.example/bag-3.jpg',
      merchantId: 'ellos',
      merchantName: 'Ellos',
      productType: 'Tote',
    }),
    product({
      id: 'shirt-1',
      name: 'Oxford Skjorte Blue',
      image: 'https://cdn.example/shirt-1.jpg',
      merchantId: 'asos',
      merchantName: 'ASOS',
      productType: 'Shirt',
    }),
    product({
      id: 'shirt-2',
      name: 'Linen Shirt White',
      image: 'https://cdn.example/shirt-2.jpg',
      merchantId: 'hm',
      merchantName: 'H&M',
      productType: 'Shirt',
    }),
    product({
      id: 'shirt-3',
      name: 'Flannel Skjorte Check',
      image: 'https://cdn.example/shirt-3.jpg',
      merchantId: 'ellos',
      merchantName: 'Ellos',
      productType: 'Shirt',
    }),
    product({
      id: 'uw-1',
      name: 'Soft Bra Undertøy',
      image: 'https://cdn.example/uw-1.jpg',
      merchantId: '19563',
      merchantName: 'Nelly NO',
      productType: 'Bra',
    }),
    product({
      id: 'uw-2',
      name: 'Cotton Truse Pack',
      image: 'https://cdn.example/uw-2.jpg',
      merchantId: 'hm',
      merchantName: 'H&M',
      productType: 'Briefs',
    }),
    product({
      id: 'uw-3',
      name: 'Lace Bralette Black',
      image: 'https://cdn.example/uw-3.jpg',
      merchantId: 'asos',
      merchantName: 'ASOS',
      productType: 'Bralette',
    }),
    product({
      id: 'beauty-1',
      name: 'Serum Sminke Glow',
      image: 'https://cdn.example/beauty-1.jpg',
      merchantId: 'kicks',
      merchantName: 'KICKS',
      category: 'Beauty',
      productType: 'Serum',
      categoryPath: 'Hudpleie/Serum',
    }),
    product({
      id: 'beauty-2',
      name: 'Mascara Black Volume',
      image: 'https://cdn.example/beauty-2.jpg',
      merchantId: 'kicks',
      merchantName: 'KICKS',
      category: 'Beauty',
      productType: 'Mascara',
    }),
    product({
      id: 'beauty-3',
      name: 'Foundation Light Beige',
      image: 'https://cdn.example/beauty-3.jpg',
      merchantId: 'kicks',
      merchantName: 'KICKS',
      category: 'Beauty',
      productType: 'Foundation',
    }),
    product({
      id: 'acc-1',
      name: 'Leather Belte Brown',
      image: 'https://cdn.example/acc-1.jpg',
      merchantId: 'asos',
      merchantName: 'ASOS',
      category: 'Accessories',
      productType: 'Belt',
    }),
    product({
      id: 'acc-2',
      name: 'Wool Skjerf Grey',
      image: 'https://cdn.example/acc-2.jpg',
      merchantId: 'hm',
      merchantName: 'H&M',
      category: 'Accessories',
      productType: 'Scarf',
    }),
    product({
      id: 'acc-3',
      name: 'Gold Bracelet Chain',
      image: 'https://cdn.example/acc-3.jpg',
      merchantId: 'ellos',
      merchantName: 'Ellos',
      category: 'Accessories',
      productType: 'Jewelry',
    }),
    product({
      id: 'acc-4',
      name: 'Classic Cap Black',
      image: 'https://cdn.example/acc-4.jpg',
      merchantId: 'asos',
      merchantName: 'ASOS',
      category: 'Accessories',
      productType: 'Cap',
    }),
    product({
      id: 'acc-5',
      name: 'Silver Øredobb Pair',
      image: 'https://cdn.example/acc-5.jpg',
      merchantId: 'ellos',
      merchantName: 'Ellos',
      category: 'Accessories',
      productType: 'Earring',
    }),
    product({
      id: 'acc-6',
      name: 'Leather Belte Black Slim',
      image: 'https://cdn.example/acc-6.jpg',
      merchantId: 'hm',
      merchantName: 'H&M',
      category: 'Accessories',
      productType: 'Belt',
    }),
  ];
}

function apiItem(partial: {
  id: string;
  name: string;
  image_url: string;
  merchant_id: string;
  merchant_name: string;
  category?: string;
  product_type?: string;
  category_path?: string;
}) {
  return {
    id: partial.id,
    aw_product_id: partial.id,
    merchant_product_id: partial.id,
    name: partial.name,
    brand: partial.merchant_name,
    description: null,
    image_url: partial.image_url,
    category: partial.category ?? null,
    category_path: partial.category_path ?? null,
    colour: null,
    size: null,
    suitable_for: null,
    product_type: partial.product_type ?? null,
    condition: null,
    brand_id: null,
    data_feed_id: null,
    is_for_sale: true,
    alternate_images: null,
    price: '199',
    old_price: null,
    currency: 'NOK',
    deep_link: null,
    merchant_name: partial.merchant_name,
    merchant_id: partial.merchant_id,
    ean: null,
    mpn: null,
    in_stock: true,
    last_updated: '2026-01-01T00:00:00.000Z',
    created_at: '2026-01-01T00:00:00.000Z',
  };
}

describe('assignCategoryPreviewsFromPool', () => {
  it('builds all 12 homepage categories from a representative bulk pool', () => {
    const { byId, gaps } = assignCategoryPreviewsFromPool(
      CATEGORY_GRID_ENTRIES,
      representativeHomepagePool(),
    );

    expect(CATEGORY_GRID_ENTRIES).toHaveLength(12);
    expect(byId.size).toBe(12);
    expect(gaps).toHaveLength(0);

    for (const entry of CATEGORY_GRID_ENTRIES) {
      const preview = byId.get(entry.id);
      expect(preview, entry.id).toBeDefined();
      expect(preview!.images.length).toBeGreaterThanOrEqual(3);
      expect(preview!.label).toBe(entry.label);
    }
  });

  it('keeps merchant metadata on CategoryPreviewPhoto for image-fit', () => {
    const { byId } = assignCategoryPreviewsFromPool(
      CATEGORY_GRID_ENTRIES,
      representativeHomepagePool(),
    );

    for (const entry of CATEGORY_GRID_ENTRIES) {
      for (const photo of byId.get(entry.id)!.images) {
        expect(photo.src).toMatch(/^https:\/\//);
        expect(photo.merchantId).toBeTruthy();
        expect(photo.merchantName).toBeTruthy();
      }
    }
  });

  it('marks deficient categories as gaps without inventing products', () => {
    const thinPool = representativeHomepagePool().filter(
      (p) => !/jeans|bukse/i.test(p.name),
    );
    const { byId, gaps } = assignCategoryPreviewsFromPool(
      CATEGORY_GRID_ENTRIES,
      thinPool,
    );

    expect(gaps.some((g) => g.id === 'jeans-bukser')).toBe(true);
    expect(byId.has('jeans-bukser')).toBe(false);
    expect(byId.size).toBeGreaterThanOrEqual(10);
  });
});

describe('productMatchesShopEntry relevance', () => {
  it('keeps dresses out of footwear and beauty out of apparel', () => {
    const dress = product({
      id: 'd1',
      name: 'Satin Kjole',
      image: 'https://cdn.example/d.jpg',
      merchantId: '19563',
      merchantName: 'Nelly',
      productType: 'Dress',
    });
    const shoe = product({
      id: 's1',
      name: 'Leather Sneaker',
      image: 'https://cdn.example/s.jpg',
      merchantId: 'asos',
      merchantName: 'ASOS',
      productType: 'Sneakers',
      categoryPath: 'Sko',
    });
    const beauty = product({
      id: 'b1',
      name: 'Glow Serum Sminke',
      image: 'https://cdn.example/b.jpg',
      merchantId: 'kicks',
      merchantName: 'KICKS',
      category: 'Beauty',
      productType: 'Serum',
    });
    const jeans = product({
      id: 'j1',
      name: 'Only - Blå - Onlblush Mid Sk Ank Rw Dnm',
      image: 'https://cdn.example/j.jpg',
      merchantId: '19563',
      merchantName: 'Nelly',
      productType: 'Jeans',
    });
    const topNotTee = product({
      id: 't1',
      name: 'Broderie Anglaise Top',
      image: 'https://cdn.example/t.jpg',
      merchantId: '19563',
      merchantName: 'Nelly',
      productType: 'Top',
    });
    const tee = product({
      id: 'tee1',
      name: 'Classic Cotton T-shirt',
      image: 'https://cdn.example/tee.jpg',
      merchantId: 'asos',
      merchantName: 'ASOS',
      productType: 'T-shirt',
    });

    const dresses = CATEGORY_GRID_ENTRIES.find((e) => e.id === 'dresses')!;
    const footwear = CATEGORY_GRID_ENTRIES.find((e) => e.id === 'footwear')!;
    const beautyEntry = CATEGORY_GRID_ENTRIES.find((e) => e.id === 'beauty')!;
    const accessories = CATEGORY_GRID_ENTRIES.find((e) => e.id === 'accessories')!;
    const tees = CATEGORY_GRID_ENTRIES.find((e) => e.id === 'tees')!;

    expect(productMatchesShopEntry(dress, dresses, 'kjole')).toBe(true);
    expect(productMatchesShopEntry(dress, footwear, 'sko')).toBe(false);
    expect(productMatchesShopEntry(shoe, footwear, 'sko')).toBe(true);
    expect(productMatchesShopEntry(beauty, beautyEntry, 'sminke')).toBe(true);
    expect(productMatchesShopEntry(beauty, dresses, 'kjole')).toBe(false);
    expect(productMatchesShopEntry(jeans, accessories, 'belte')).toBe(false);
    expect(productMatchesShopEntry(topNotTee, tees, 't-shirt')).toBe(false);
    expect(productMatchesShopEntry(tee, tees, 't-shirt')).toBe(true);
  });
});

describe('fetchCategoryPreviews homepage gap-fill', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('issues gap-fill only for deficient categories', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.test.clea';

    const poolByMerchant: Record<string, ReturnType<typeof apiItem>[]> = {
      '19563': [
        apiItem({
          id: 'dress-1',
          name: 'Satin Kjole',
          image_url: 'https://cdn.example/dress-1.jpg',
          merchant_id: '19563',
          merchant_name: 'Nelly NO',
          product_type: 'Dress',
        }),
        apiItem({
          id: 'dress-2',
          name: 'Midi Kjole Floral',
          image_url: 'https://cdn.example/dress-2.jpg',
          merchant_id: '19563',
          merchant_name: 'Nelly NO',
          product_type: 'Dress',
        }),
        apiItem({
          id: 'dress-3',
          name: 'Summer Dress White',
          image_url: 'https://cdn.example/dress-3.jpg',
          merchant_id: '19563',
          merchant_name: 'Nelly NO',
          product_type: 'Dress',
        }),
      ],
      asos: [],
      ellos: [],
      hm: [],
      bubbleroom: [],
      '384513': [],
      miinto: [],
      kicks: [
        apiItem({
          id: 'serum-1',
          name: 'Serum Sminke Glow',
          image_url: 'https://cdn.example/serum-1.jpg',
          merchant_id: 'kicks',
          merchant_name: 'KICKS',
          category: 'Beauty',
          product_type: 'Serum',
        }),
        apiItem({
          id: 'serum-2',
          name: 'Mascara Black',
          image_url: 'https://cdn.example/serum-2.jpg',
          merchant_id: 'kicks',
          merchant_name: 'KICKS',
          category: 'Beauty',
          product_type: 'Mascara',
        }),
        apiItem({
          id: 'serum-3',
          name: 'Foundation Beige',
          image_url: 'https://cdn.example/serum-3.jpg',
          merchant_id: 'kicks',
          merchant_name: 'KICKS',
          category: 'Beauty',
          product_type: 'Foundation',
        }),
      ],
    };

    const catalogUrls: string[] = [];

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        catalogUrls.push(url);

        if (url.includes('/catalog?') && url.includes('merchant_id=')) {
          const mid = new URL(url).searchParams.get('merchant_id') ?? '';
          const items = poolByMerchant[mid] ?? [];
          return new Response(
            JSON.stringify({
              items,
              total: items.length,
              hasMore: false,
              limit: 48,
              offset: 0,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          );
        }

        // Gap-fill path: no merchant_id (family/q/segment filters).
        if (url.includes('/catalog?')) {
          const qs = new URL(url).searchParams;
          const q = (qs.get('q') ?? '').toLowerCase();
          const family = qs.get('product_family') ?? '';
          let items: ReturnType<typeof apiItem>[] = [];
          if (q.includes('jeans') || family === 'bottoms') {
            items = [
              apiItem({
                id: 'gap-jeans',
                name: 'Gap Fill Jeans',
                image_url: 'https://cdn.example/gap-jeans.jpg',
                merchant_id: 'gap',
                merchant_name: 'Gap Merchant',
                product_type: 'Jeans',
              }),
              apiItem({
                id: 'gap-jeans-2',
                name: 'Gap Fill Bukse',
                image_url: 'https://cdn.example/gap-jeans-2.jpg',
                merchant_id: 'gap2',
                merchant_name: 'Gap Merchant 2',
                product_type: 'Pants',
              }),
              apiItem({
                id: 'gap-jeans-3',
                name: 'Another Jeans',
                image_url: 'https://cdn.example/gap-jeans-3.jpg',
                merchant_id: 'gap3',
                merchant_name: 'Gap Merchant 3',
                product_type: 'Jeans',
              }),
            ];
          }
          return new Response(
            JSON.stringify({
              items,
              total: items.length,
              hasMore: false,
              limit: 6,
              offset: 0,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          );
        }

        return new Response('not found', { status: 404 });
      }),
    );

    const entries: CategoryGridEntry[] = [
      CATEGORY_GRID_ENTRIES.find((e) => e.id === 'dresses')!,
      CATEGORY_GRID_ENTRIES.find((e) => e.id === 'jeans-bukser')!,
      CATEGORY_GRID_ENTRIES.find((e) => e.id === 'beauty')!,
    ];

    const previews = await fetchCategoryPreviews(entries);

    const merchantPoolCalls = catalogUrls.filter((u) =>
      u.includes('merchant_id='),
    );
    const gapFillCalls = catalogUrls.filter(
      (u) => u.includes('/catalog?') && !u.includes('merchant_id='),
    );

    expect(merchantPoolCalls.length).toBe(8);
    // Only jeans is deficient from the thin merchant pools.
    expect(gapFillCalls.length).toBe(1);
    expect(gapFillCalls[0]).toMatch(/q=jeans|product_family=bottoms/);

    const jeans = previews.find((p) => p.id === 'jeans-bukser');
    expect(jeans?.images.length).toBeGreaterThanOrEqual(3);
    expect(jeans?.images[0]?.merchantId).toBeTruthy();

    const dresses = previews.find((p) => p.id === 'dresses');
    expect(dresses?.images.length).toBeGreaterThanOrEqual(1);
    // Dresses already had a pool hit — should not appear in gap-fill qs alone.
    expect(
      gapFillCalls.every(
        (u) => !u.includes('kjole') && !u.includes('product_family=dresses'),
      ),
    ).toBe(true);
  });
});
