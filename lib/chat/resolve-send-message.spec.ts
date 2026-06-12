import { describe, expect, it } from 'vitest';
import { resolveSendMessage } from '@/lib/chat/resolve-send-message';
import {
  ANCHOR_CHEAPER_MESSAGE,
  ANCHOR_SIMILAR_MESSAGE,
} from '@/lib/chat/anchor-actions';

const PREVIEW = {
  productId: 'prod-1',
  name: 'Boot',
  image: '/boot.jpg',
  brand: 'Scarosso',
} as const;

describe('resolveSendMessage', () => {
  it('shows product reference for product-card custom input', () => {
    expect(
      resolveSendMessage({
        query: 'med tykkere såle',
        source: 'product-card',
        explicitContext: { productId: PREVIEW.productId },
        activeProductId: null,
        anchorPreview: PREVIEW,
      }),
    ).toEqual({
      context: { productId: PREVIEW.productId },
      anchorPreview: PREVIEW,
      showAsProductReference: true,
      clearActiveProduct: false,
    });
  });

  it('clears stale anchor when a clarify suggestion chip is selected', () => {
    expect(
      resolveSendMessage({
        query: "What's your budget?",
        source: 'suggestion',
        activeProductId: 'prod-1',
        suggestionSourceAnchorProductId: 'prod-1',
        anchorPreview: PREVIEW,
      }),
    ).toEqual({
      context: undefined,
      anchorPreview: undefined,
      showAsProductReference: false,
      clearActiveProduct: true,
    });
  });

  it('keeps product context for anchor-dependent suggestion chips without image UI', () => {
    expect(
      resolveSendMessage({
        query: 'noe billigere',
        source: 'suggestion',
        activeProductId: 'prod-1',
      }),
    ).toEqual({
      context: { productId: 'prod-1' },
      anchorPreview: undefined,
      showAsProductReference: false,
      clearActiveProduct: false,
    });
  });

  it('shows product reference for anchor quick actions', () => {
    expect(
      resolveSendMessage({
        query: ANCHOR_SIMILAR_MESSAGE,
        source: 'anchor-action',
        explicitContext: { productId: PREVIEW.productId },
        activeProductId: null,
        anchorPreview: PREVIEW,
      }),
    ).toEqual({
      context: { productId: PREVIEW.productId },
      anchorPreview: PREVIEW,
      showAsProductReference: true,
      clearActiveProduct: false,
    });
  });

  it('clears stale anchor for plain composer messages', () => {
    expect(
      resolveSendMessage({
        query: 'svart kjole til fest',
        source: 'composer',
        activeProductId: 'prod-1',
      }),
    ).toEqual({
      context: undefined,
      anchorPreview: undefined,
      showAsProductReference: false,
      clearActiveProduct: true,
    });
  });

  it('keeps anchor context for anchor-dependent composer text', () => {
    expect(
      resolveSendMessage({
        query: 'finn lignende i størrelse 42',
        source: 'composer',
        activeProductId: 'prod-1',
      }),
    ).toEqual({
      context: { productId: 'prod-1' },
      anchorPreview: undefined,
      showAsProductReference: false,
      clearActiveProduct: false,
    });
  });

  it('keeps anchor context for colour variant composer text', () => {
    expect(
      resolveSendMessage({
        query: 'same in pink color',
        source: 'composer',
        activeProductId: 'prod-1',
      }),
    ).toEqual({
      context: { productId: 'prod-1' },
      anchorPreview: undefined,
      showAsProductReference: false,
      clearActiveProduct: false,
    });
  });

  it('keeps product context when composer reuses an anchor phrase', () => {
    expect(
      resolveSendMessage({
        query: ANCHOR_CHEAPER_MESSAGE,
        source: 'composer',
        activeProductId: 'prod-1',
      }),
    ).toEqual({
      context: { productId: 'prod-1' },
      anchorPreview: undefined,
      showAsProductReference: false,
      clearActiveProduct: false,
    });
  });
});
