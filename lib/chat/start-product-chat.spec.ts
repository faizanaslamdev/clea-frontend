import { describe, expect, it } from 'vitest';
import {
  ANCHOR_CHEAPER_MESSAGE,
  ANCHOR_SIMILAR_MESSAGE,
} from '@/lib/chat/anchor-actions';
import { resolveHydratedSendSource } from '@/lib/chat/start-product-chat';

const PREVIEW = {
  productId: 'p1',
  name: 'Boot',
  image: '/boot.jpg',
  brand: 'Brand',
};

describe('resolveHydratedSendSource', () => {
  it('uses composer when no anchor preview is stored', () => {
    expect(resolveHydratedSendSource('black boots', undefined)).toBe('composer');
  });

  it('uses anchor-action for stored anchor quick actions', () => {
    expect(resolveHydratedSendSource(ANCHOR_SIMILAR_MESSAGE, PREVIEW)).toBe(
      'anchor-action',
    );
    expect(resolveHydratedSendSource(ANCHOR_CHEAPER_MESSAGE, PREVIEW)).toBe(
      'anchor-action',
    );
  });

  it('uses product-card for stored custom product prompts', () => {
    expect(
      resolveHydratedSendSource('in black leather', PREVIEW),
    ).toBe('product-card');
  });
});
