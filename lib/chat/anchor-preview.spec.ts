import { describe, expect, it } from 'vitest';
import {
  anchorPreviewFromProduct,
  findAnchorPreviewInMessages,
  isAnchorActionMessage,
} from '@/lib/chat/anchor-preview';
import {
  ANCHOR_CHEAPER_MESSAGE,
  ANCHOR_SIMILAR_MESSAGE,
} from '@/lib/chat/anchor-actions';

const PRODUCT = {
  id: '6085790a-490d-418e-839f-9bfc083256c8',
  name: 'Nike Air Force 1',
  brand: 'Nike',
  image: '/nike.jpg',
} as const;

describe('isAnchorActionMessage', () => {
  it('recognizes similar and cheaper anchor messages', () => {
    expect(isAnchorActionMessage(ANCHOR_SIMILAR_MESSAGE)).toBe(true);
    expect(isAnchorActionMessage(ANCHOR_CHEAPER_MESSAGE)).toBe(true);
    expect(isAnchorActionMessage('jakke under 800 kr')).toBe(false);
  });
});

describe('anchorPreviewFromProduct', () => {
  it('maps product fields into anchor preview', () => {
    expect(anchorPreviewFromProduct(PRODUCT)).toEqual({
      productId: PRODUCT.id,
      name: PRODUCT.name,
      image: PRODUCT.image,
      brand: PRODUCT.brand,
    });
  });
});

describe('findAnchorPreviewInMessages', () => {
  it('reuses preview from prior user anchor turns', () => {
    const preview = anchorPreviewFromProduct(PRODUCT);
    const result = findAnchorPreviewInMessages(
      [{ anchorPreview: preview }],
      PRODUCT.id,
    );

    expect(result).toEqual(preview);
  });

  it('falls back to assistant product grids', () => {
    const result = findAnchorPreviewInMessages(
      [
        {
          products: [
            {
              ...PRODUCT,
              category: 'Fashion',
              description: '',
              sku: '',
              matchType: 'exact',
              rating: 0,
              reviewCount: 0,
              prices: {},
              priceHistory: [],
              inStock: {},
              currency: 'NOK',
            },
          ],
        },
      ],
      PRODUCT.id,
    );

    expect(result).toEqual(anchorPreviewFromProduct(PRODUCT));
  });
});
