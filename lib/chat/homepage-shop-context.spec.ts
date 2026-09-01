import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getPendingBootstrapEntry,
  resolveBootstrapShopCategory,
  savePendingBootstrapEntry,
  tryClaimBootstrapEntry,
} from '@/lib/chat/chat-bootstrap-entry';
import { navigateToChatEntry } from '@/lib/chat/chat-entry';
import {
  buildBootstrapHydrationContext,
  mergeShopCategoryIntoTurnContext,
  resolveHomepageBootstrapSession,
} from '@/lib/chat/bootstrap-send-context';

describe('homepage shop context bootstrap', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it('Dame search bootstraps womens in pending entry', () => {
    vi.stubGlobal('crypto', {
      randomUUID: vi
        .fn()
        .mockReturnValueOnce('entry-dame')
        .mockReturnValueOnce('turn-dame'),
    });
    const push = vi.fn();
    navigateToChatEntry({ push } as never, {
      query: 'Løpesko',
      shopCategory: 'womens',
    });

    expect(getPendingBootstrapEntry('entry-dame')).toMatchObject({
      query: 'Løpesko',
      shopCategory: 'womens',
      clientTurnId: 'turn-dame',
    });
    expect(push.mock.calls[0]?.[0]).not.toContain('category=');
  });

  it('Herre search bootstraps mens in pending entry', () => {
    vi.stubGlobal('crypto', {
      randomUUID: vi
        .fn()
        .mockReturnValueOnce('entry-herre')
        .mockReturnValueOnce('turn-herre'),
    });
    const push = vi.fn();
    navigateToChatEntry({ push } as never, {
      query: 'Løpesko',
      shopCategory: 'mens',
    });

    expect(getPendingBootstrapEntry('entry-herre')).toMatchObject({
      query: 'Løpesko',
      shopCategory: 'mens',
    });
  });

  it('resolveBootstrapShopCategory prefers URL legacy over bootstrap tab', () => {
    expect(
      resolveBootstrapShopCategory(
        { shopCategory: 'womens', legacyShopCategory: 'womens' },
        'mens',
      ),
    ).toBe('mens');
  });

  it('selected shopCategory reaches conversation creation and first turn', () => {
    savePendingBootstrapEntry({
      entryId: 'entry-1',
      query: 'Hettegenser',
      shopCategory: 'womens',
      clientTurnId: 'turn-1',
    });
    const claimed = tryClaimBootstrapEntry('entry-1');
    expect(claimed).not.toBeNull();

    const session = resolveHomepageBootstrapSession({ entry: claimed! });
    expect(session.createConversationShopCategory).toBe('womens');
    expect(session.firstTurnRequestContext).toEqual({ shopCategory: 'womens' });
  });

  it('subsequent turns preserve shopCategory via requestTurn merge', () => {
    expect(
      mergeShopCategoryIntoTurnContext('mens', { intent: 'product_search' }),
    ).toEqual({
      intent: 'product_search',
      shopCategory: 'mens',
    });
  });

  it('legacy category URLs still resolve through bootstrap legacy field', () => {
    const session = resolveHomepageBootstrapSession({
      entry: { legacyShopCategory: 'mens' },
      urlLegacyShopCategory: 'mens',
    });
    expect(session.shopCategory).toBe('mens');
    expect(session.firstTurnRequestContext).toEqual({ shopCategory: 'mens' });
  });

  it('direct chat without homepage context has no shopCategory', () => {
    savePendingBootstrapEntry({
      entryId: 'entry-plain',
      query: 'Regnjakke',
      clientTurnId: 'turn-plain',
    });
    const claimed = tryClaimBootstrapEntry('entry-plain');
    const session = resolveHomepageBootstrapSession({ entry: claimed! });
    expect(session.shopCategory).toBeUndefined();
    expect(session.firstTurnRequestContext).toBeUndefined();
  });

  it('product anchor hydration keeps shopCategory on merged first turn', () => {
    const session = resolveHomepageBootstrapSession({
      entry: { shopCategory: 'womens' },
      anchorPreview: {
        productId: 'prod-1',
        name: 'Jakke',
        image: '',
      },
    });

    expect(buildBootstrapHydrationContext({
      shopCategory: 'womens',
      anchorPreview: {
        productId: 'prod-1',
        name: 'Jakke',
        image: '',
      },
    })).toEqual({
      productId: 'prod-1',
    });
    expect(session.firstTurnRequestContext).toEqual({
      productId: 'prod-1',
      shopCategory: 'womens',
    });
  });
});
