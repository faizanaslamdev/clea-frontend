import { describe, expect, it } from 'vitest';
import type { ChatTurnResult } from '@/lib/api/chat-types';
import {
  buildErrorTurnMessagePair,
  buildTurnMessagePair,
  userMessageOptionsForTurn,
} from '@/lib/chat/chat-messages';
import {
  ANCHOR_CHEAPER_MESSAGE,
  ANCHOR_SIMILAR_MESSAGE,
} from '@/lib/chat/anchor-actions';

const ANCHOR_PREVIEW = {
  productId: '6085790a-490d-418e-839f-9bfc083256c8',
  name: 'Nike Air Force 1',
  image: '/nike.jpg',
  brand: 'Nike',
} as const;

const TURN: ChatTurnResult = {
  reply: 'Her er lignende produkter.',
  intent: 'similar_products',
  products: [],
  total: 0,
  limit: 12,
  offset: 0,
  hasMore: false,
  anchorProductId: ANCHOR_PREVIEW.productId,
  usedFallback: false,
};

describe('userMessageOptionsForTurn', () => {
  it('attaches anchor preview for similar action messages', () => {
    expect(
      userMessageOptionsForTurn(ANCHOR_SIMILAR_MESSAGE, {
        anchorPreview: ANCHOR_PREVIEW,
      }),
    ).toEqual({
      anchorProductId: ANCHOR_PREVIEW.productId,
      anchorPreview: ANCHOR_PREVIEW,
    });
  });

  it('attaches anchor preview for cheaper action messages', () => {
    expect(
      userMessageOptionsForTurn(ANCHOR_CHEAPER_MESSAGE, {
        anchorPreview: ANCHOR_PREVIEW,
      }),
    ).toEqual({
      anchorProductId: ANCHOR_PREVIEW.productId,
      anchorPreview: ANCHOR_PREVIEW,
    });
  });

  it('skips preview for normal search text', () => {
    expect(
      userMessageOptionsForTurn('jakke under 800 kr', {
        anchorPreview: ANCHOR_PREVIEW,
      }),
    ).toBeUndefined();
  });

  it('attaches preview for custom product reference text', () => {
    expect(
      userMessageOptionsForTurn('med tykkere såle', {
        anchorPreview: ANCHOR_PREVIEW,
        showAsProductReference: true,
      }),
    ).toEqual({
      anchorProductId: ANCHOR_PREVIEW.productId,
      anchorPreview: ANCHOR_PREVIEW,
    });
  });
});

describe('buildTurnMessagePair', () => {
  it('renders anchor metadata on user messages for anchor actions', () => {
    const [userMessage, assistantMessage] = buildTurnMessagePair(
      ANCHOR_SIMILAR_MESSAGE,
      TURN,
      { anchorPreview: ANCHOR_PREVIEW },
    );

    expect(userMessage.role).toBe('user');
    expect(userMessage.content).toBe(ANCHOR_SIMILAR_MESSAGE);
    expect(userMessage.anchorPreview).toEqual(ANCHOR_PREVIEW);
    expect(assistantMessage.role).toBe('assistant');
    expect(assistantMessage.anchorProductId).toBe(ANCHOR_PREVIEW.productId);
  });

  it('keeps plain user text for normal search turns', () => {
    const [userMessage] = buildTurnMessagePair('nike sneakers', TURN);

    expect(userMessage.content).toBe('nike sneakers');
    expect(userMessage.anchorPreview).toBeUndefined();
  });
});

describe('buildErrorTurnMessagePair', () => {
  it('preserves anchor preview on failed anchor turns', () => {
    const [userMessage] = buildErrorTurnMessagePair(
      ANCHOR_CHEAPER_MESSAGE,
      'Noe gikk galt.',
      { anchorPreview: ANCHOR_PREVIEW },
    );

    expect(userMessage.anchorPreview).toEqual(ANCHOR_PREVIEW);
    expect(userMessage.content).toBe(ANCHOR_CHEAPER_MESSAGE);
  });
});
