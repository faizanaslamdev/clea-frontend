import { describe, expect, it } from 'vitest';
import {
  mapRestoreConversationToMessages,
  resolveRestoredActiveProductId,
} from '@/lib/chat/restore-conversation-messages';
import type { RestoreConversationResponse } from '@/lib/api/chat-types';
import { ANCHOR_SIMILAR_MESSAGE } from '@/lib/chat/anchor-actions';

const PRODUCT_REF = {
  productId: '11111111-1111-4111-8111-111111111111',
  name: 'Fit 2 Slim Jean',
  image: 'https://cdn.example/jean.jpg',
  brand: 'RAG & BONE',
  price: 171,
  currency: 'USD',
  merchantName: 'Jared',
} as const;

describe('mapRestoreConversationToMessages', () => {
  it('maps ordered turns into UI messages with catalog state', () => {
    const restored: RestoreConversationResponse = {
      conversationId: 'conv-1',
      locale: 'nb',
      activeSearchIntent: {},
      pendingClarifySlots: null,
      hasMoreCatalog: true,
      turns: [
        {
          seq: 1,
          role: 'user',
          message: 'Treningsklær',
          clientTurnId: 'client-1',
        },
        {
          seq: 2,
          role: 'assistant',
          message: 'Her er noen produkter.',
          reply: 'Her er noen produkter.',
          intent: 'product_search',
          products: [],
          total: 24,
          limit: 12,
          offset: 0,
          hasMore: true,
          catalogQuery: { q: 'treningsklær', offset: 0 },
        },
      ],
    };

    const messages = mapRestoreConversationToMessages(restored);

    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({
      role: 'user',
      content: 'Treningsklær',
      id: 'client-1',
    });
    expect(messages[1]).toMatchObject({
      role: 'assistant',
      status: 'complete',
      searchHasMore: true,
      catalogQuery: { q: 'treningsklær', offset: 0 },
      query: 'Treningsklær',
    });
  });

  it('hydrates durable product reference on user turns after refresh', () => {
    const restored: RestoreConversationResponse = {
      conversationId: 'conv-2',
      locale: 'nb',
      activeSearchIntent: {},
      pendingClarifySlots: null,
      hasMoreCatalog: false,
      turns: [
        {
          seq: 1,
          role: 'user',
          message: ANCHOR_SIMILAR_MESSAGE,
          clientTurnId: 'client-sim',
          productReference: PRODUCT_REF,
        },
        {
          seq: 2,
          role: 'assistant',
          message: 'Her er lignende',
          reply: 'Her er lignende',
          intent: 'similar_products',
          products: [],
          total: 0,
          limit: 12,
          offset: 0,
          hasMore: false,
          anchorProductId: PRODUCT_REF.productId,
        },
      ],
    };

    const messages = mapRestoreConversationToMessages(restored);

    expect(messages[0]).toMatchObject({
      role: 'user',
      content: ANCHOR_SIMILAR_MESSAGE,
      anchorProductId: PRODUCT_REF.productId,
      anchorPreview: {
        productId: PRODUCT_REF.productId,
        name: PRODUCT_REF.name,
        image: PRODUCT_REF.image,
        brand: PRODUCT_REF.brand,
        price: PRODUCT_REF.price,
        currency: PRODUCT_REF.currency,
        merchantName: PRODUCT_REF.merchantName,
      },
    });
  });

  it('restores A/B/C references independently and keeps follow-ups text-only', () => {
    const productB = {
      productId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      name: 'Boot B',
      image: 'https://cdn.example/b.jpg',
      brand: 'Brand B',
      price: 200,
      currency: 'NOK',
    };
    const productC = {
      productId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      name: 'Coat C',
      image: 'https://cdn.example/c.jpg',
      brand: 'Brand C',
      price: 300,
      currency: 'NOK',
      merchantName: 'Store C',
      unavailable: true,
    };

    const messages = mapRestoreConversationToMessages({
      conversationId: 'conv-abc',
      locale: 'nb',
      activeSearchIntent: {},
      pendingClarifySlots: null,
      hasMoreCatalog: false,
      turns: [
        {
          seq: 1,
          role: 'user',
          message: ANCHOR_SIMILAR_MESSAGE,
          productReference: PRODUCT_REF,
        },
        {
          seq: 2,
          role: 'assistant',
          message: 'A',
          reply: 'A',
          intent: 'similar_products',
          products: [],
          total: 0,
          limit: 12,
          offset: 0,
          hasMore: false,
          anchorProductId: PRODUCT_REF.productId,
        },
        {
          seq: 3,
          role: 'user',
          message: 'Finn billigere alternativer',
          productReference: productB,
        },
        {
          seq: 4,
          role: 'assistant',
          message: 'B',
          reply: 'B',
          intent: 'cheaper_alternatives',
          products: [],
          total: 0,
          limit: 12,
          offset: 0,
          hasMore: false,
          anchorProductId: productB.productId,
        },
        {
          seq: 5,
          role: 'user',
          message: 'finnes denne i ull?',
          productReference: productC,
        },
        {
          seq: 6,
          role: 'assistant',
          message: 'C',
          reply: 'C',
          intent: 'product_search',
          products: [],
          total: 0,
          limit: 12,
          offset: 0,
          hasMore: false,
          anchorProductId: productC.productId,
        },
        {
          seq: 7,
          role: 'user',
          message: 'bare svart',
        },
        {
          seq: 8,
          role: 'assistant',
          message: 'ok',
          reply: 'ok',
          intent: 'product_search',
          products: [],
          total: 0,
          limit: 12,
          offset: 0,
          hasMore: false,
        },
      ],
    });

    expect(messages[0].anchorPreview?.productId).toBe(PRODUCT_REF.productId);
    expect(messages[2].anchorPreview?.productId).toBe(productB.productId);
    expect(messages[4].anchorPreview).toMatchObject({
      productId: productC.productId,
      unavailable: true,
    });
    expect(messages[6].anchorPreview).toBeUndefined();
    expect(messages[6].content).toBe('bare svart');
  });

  it('does not invent a product reference when history has none', () => {
    const restored: RestoreConversationResponse = {
      conversationId: 'conv-3',
      locale: 'nb',
      activeSearchIntent: {},
      pendingClarifySlots: null,
      hasMoreCatalog: false,
      turns: [
        {
          seq: 1,
          role: 'user',
          message: ANCHOR_SIMILAR_MESSAGE,
          clientTurnId: 'legacy',
        },
        {
          seq: 2,
          role: 'assistant',
          message: 'ok',
          reply: 'ok',
          intent: 'similar_products',
          products: [],
          total: 0,
          limit: 12,
          offset: 0,
          hasMore: false,
        },
      ],
    };

    const messages = mapRestoreConversationToMessages(restored);
    expect(messages[0].anchorPreview).toBeUndefined();
    expect(messages[0].anchorProductId).toBeUndefined();
  });
});

describe('resolveRestoredActiveProductId', () => {
  it('prefers conversation-level anchorProductId', () => {
    expect(
      resolveRestoredActiveProductId({
        conversationId: 'c',
        locale: 'nb',
        activeSearchIntent: {},
        pendingClarifySlots: null,
        hasMoreCatalog: false,
        anchorProductId: 'conv-anchor',
        turns: [
          {
            seq: 1,
            role: 'user',
            message: ANCHOR_SIMILAR_MESSAGE,
            productReference: PRODUCT_REF,
          },
        ],
      }),
    ).toBe('conv-anchor');
  });

  it('falls back to last user productReference for follow-up grounding', () => {
    expect(
      resolveRestoredActiveProductId({
        conversationId: 'c',
        locale: 'nb',
        activeSearchIntent: {},
        pendingClarifySlots: null,
        hasMoreCatalog: false,
        turns: [
          {
            seq: 1,
            role: 'user',
            message: ANCHOR_SIMILAR_MESSAGE,
            productReference: PRODUCT_REF,
          },
          {
            seq: 2,
            role: 'assistant',
            message: 'ok',
            reply: 'ok',
            intent: 'similar_products',
            products: [],
            total: 0,
            limit: 12,
            offset: 0,
            hasMore: false,
            anchorProductId: PRODUCT_REF.productId,
          },
          {
            seq: 3,
            role: 'user',
            message: 'bare svart',
          },
        ],
      }),
    ).toBe(PRODUCT_REF.productId);
  });
});
