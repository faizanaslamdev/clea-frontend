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
      context: {
        productId: PREVIEW.productId,
        productReference: PREVIEW,
      },
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
      context: {
        productId: PREVIEW.productId,
        productReference: PREVIEW,
      },
      anchorPreview: PREVIEW,
      showAsProductReference: true,
      clearActiveProduct: false,
    });
  });

  it('attaches product A snapshot and does not reuse product B preview', () => {
    const productB = {
      productId: 'prod-2',
      name: 'Other',
      image: '/other.jpg',
    };
    expect(
      resolveSendMessage({
        query: ANCHOR_CHEAPER_MESSAGE,
        source: 'anchor-action',
        explicitContext: { productId: PREVIEW.productId },
        activeProductId: productB.productId,
        anchorPreview: PREVIEW,
      }),
    ).toMatchObject({
      context: {
        productId: PREVIEW.productId,
        productReference: { productId: PREVIEW.productId },
      },
      anchorPreview: PREVIEW,
      showAsProductReference: true,
    });
  });

  it('keeps A then B then custom C as distinct wire contexts', () => {
    const productA = {
      productId: 'prod-a',
      name: 'Jean A',
      image: '/a.jpg',
      brand: 'A',
      price: 100,
    };
    const productB = {
      productId: 'prod-b',
      name: 'Boot B',
      image: '/b.jpg',
      brand: 'B',
      price: 200,
    };
    const productC = {
      productId: 'prod-c',
      name: 'Coat C',
      image: '/c.jpg',
      brand: 'C',
      price: 300,
      merchantName: 'Store C',
    };

    const turnA = resolveSendMessage({
      query: ANCHOR_SIMILAR_MESSAGE,
      source: 'anchor-action',
      explicitContext: { productId: productA.productId },
      activeProductId: null,
      anchorPreview: productA,
    });
    const turnB = resolveSendMessage({
      query: ANCHOR_CHEAPER_MESSAGE,
      source: 'anchor-action',
      explicitContext: { productId: productB.productId },
      activeProductId: productA.productId,
      anchorPreview: productB,
    });
    const turnC = resolveSendMessage({
      query: 'finnes denne i ull?',
      source: 'product-card',
      explicitContext: { productId: productC.productId },
      activeProductId: productB.productId,
      anchorPreview: productC,
    });
    const followUp = resolveSendMessage({
      query: 'bare svart',
      source: 'composer',
      activeProductId: productC.productId,
    });

    expect(turnA.context?.productId).toBe(productA.productId);
    expect(turnA.context?.productReference?.productId).toBe(productA.productId);
    expect(turnB.context?.productId).toBe(productB.productId);
    expect(turnB.context?.productReference?.name).toBe('Boot B');
    expect(turnC.context?.productId).toBe(productC.productId);
    expect(turnC.context?.productReference?.merchantName).toBe('Store C');
    expect(turnC.showAsProductReference).toBe(true);
    // Follow-up is text-only for display; productId grounding uses existing composer heuristics.
    expect(followUp.anchorPreview).toBeUndefined();
    expect(followUp.showAsProductReference).toBe(false);
    expect(followUp.context?.productReference).toBeUndefined();
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
