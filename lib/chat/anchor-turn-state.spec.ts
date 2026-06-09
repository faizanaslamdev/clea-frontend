import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearAnchorTurnContext,
  filterSuggestionsForAnchor,
  reconcileAnchorSessionForMessage,
  saveAnchorTurnContext,
} from '@/lib/chat/anchor-actions';
import {
  shouldClearActiveProductId,
  syncAnchorSessionForTurn,
} from '@/lib/chat/anchor-turn-state';

const ANCHOR_ID = '6085790a-490d-418e-839f-9bfc083256c8';
const ANCHOR_SUGGESTIONS = [
  'Finn billigere alternativer',
  'Vis billigere alternativer',
] as const;

describe('shouldClearActiveProductId', () => {
  it('returns false when similar/cheaper turn includes productId', () => {
    expect(
      shouldClearActiveProductId({
        productId: ANCHOR_ID,
      }),
    ).toBe(false);
  });

  it('returns true for normal composer search without productId', () => {
    expect(shouldClearActiveProductId(undefined)).toBe(true);
    expect(shouldClearActiveProductId({})).toBe(true);
    expect(
      shouldClearActiveProductId({
        catalog: { q: 'jakke', segment: 'fashion', offset: 0 },
      }),
    ).toBe(true);
  });
});

describe('anchor chip availability', () => {
  it('exposes anchor chips while an anchor is active', () => {
    expect(
      filterSuggestionsForAnchor(ANCHOR_SUGGESTIONS, ANCHOR_ID),
    ).toEqual([...ANCHOR_SUGGESTIONS]);
  });

  it('hides anchor chips after anchor is cleared', () => {
    expect(filterSuggestionsForAnchor(ANCHOR_SUGGESTIONS, undefined)).toBeUndefined();
  });
});

describe('syncAnchorSessionForTurn', () => {
  afterEach(() => {
    clearAnchorTurnContext();
    vi.restoreAllMocks();
  });

  it('persists session anchor on similar flow', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    syncAnchorSessionForTurn(
      { productId: ANCHOR_ID },
      'Vis lignende produkter',
      {
        anchorPreview: {
          productId: ANCHOR_ID,
          name: 'Nike Air Force 1',
          image: '/nike.jpg',
          brand: 'Nike',
        },
      },
    );

    expect(setItem).toHaveBeenCalledWith(
      'clea-chat-anchor',
      JSON.stringify({
        productId: ANCHOR_ID,
        message: 'Vis lignende produkter',
        preview: {
          name: 'Nike Air Force 1',
          image: '/nike.jpg',
          brand: 'Nike',
        },
      }),
    );
    expect(loadAnchorFromSession('Vis lignende produkter')).toBe(ANCHOR_ID);
  });

  it('clears session anchor on normal search', () => {
    saveAnchorTurnContext(ANCHOR_ID, 'Vis lignende produkter');

    syncAnchorSessionForTurn(undefined, 'jakke under 800 kr');

    expect(loadAnchorFromSession('Vis lignende produkter')).toBeUndefined();
    expect(loadAnchorFromSession('jakke under 800 kr')).toBeUndefined();
  });
});

function loadAnchorFromSession(message: string): string | undefined {
  const raw = sessionStorage.getItem('clea-chat-anchor');
  if (!raw) return undefined;

  const parsed = JSON.parse(raw) as { productId?: string; message?: string };
  return parsed.message === message ? parsed.productId : undefined;
}

describe('reconcileAnchorSessionForMessage', () => {
  afterEach(() => {
    clearAnchorTurnContext();
  });

  it('returns preview when stored message matches url query', () => {
    saveAnchorTurnContext(ANCHOR_ID, 'Vis lignende produkter', {
      name: 'Nike Air Force 1',
      image: '/nike.jpg',
      brand: 'Nike',
    });

    expect(reconcileAnchorSessionForMessage('Vis lignende produkter')).toEqual({
      productId: ANCHOR_ID,
      name: 'Nike Air Force 1',
      image: '/nike.jpg',
      brand: 'Nike',
    });
  });

  it('clears stale anchor session when url query differs', () => {
    saveAnchorTurnContext(ANCHOR_ID, 'Vis lignende produkter');

    expect(reconcileAnchorSessionForMessage('jakke under 800 kr')).toBeUndefined();
    expect(sessionStorage.getItem('clea-chat-anchor')).toBeNull();
  });
});
