import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ANCHOR_SIMILAR_MESSAGE,
} from '@/lib/chat/anchor-actions';
import {
  anchorPreviewFromPendingEntry,
  CHAT_BOOTSTRAP_CLAIMED_KEY,
  CHAT_BOOTSTRAP_PENDING_KEY,
  clearBootstrapEntryState,
  completeBootstrapEntry,
  createLegacyBootstrapEntry,
  getPendingBootstrapEntry,
  releaseBootstrapEntryClaim,
  savePendingBootstrapEntry,
  shouldHydrateBootstrapEntry,
  tryClaimBootstrapEntry,
} from '@/lib/chat/chat-bootstrap-entry';
import {
  buildChatEntryUrl,
  buildLegacyChatEntryUrl,
  navigateToChatEntry,
  parseChatEntryBootstrap,
} from '@/lib/chat/chat-entry';
import { resolveSendMessage } from '@/lib/chat/resolve-send-message';

describe('entry-instance bootstrap lifecycle', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal('crypto', {
      randomUUID: vi
        .fn()
        .mockReturnValueOnce('entry-a')
        .mockReturnValueOnce('turn-a')
        .mockReturnValueOnce('entry-b')
        .mockReturnValueOnce('turn-b')
        .mockReturnValueOnce('entry-c')
        .mockReturnValueOnce('turn-c')
        .mockReturnValueOnce('entry-d')
        .mockReturnValueOnce('turn-d'),
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  function simulateExternalEntry(input: {
    query: string;
    productId?: string;
    entryId?: string;
    clientTurnId?: string;
  }) {
    const entryId = input.entryId ?? crypto.randomUUID();
    const clientTurnId = input.clientTurnId ?? crypto.randomUUID();
    savePendingBootstrapEntry({
      entryId,
      query: input.query,
      productId: input.productId,
      clientTurnId,
    });
    return { entryId, clientTurnId };
  }

  it('A: same product CTA twice creates two independent bootstrap entries', () => {
    const first = simulateExternalEntry({
      query: ANCHOR_SIMILAR_MESSAGE,
      productId: 'prod-a',
      entryId: 'entry-a',
      clientTurnId: 'turn-a',
    });
    expect(tryClaimBootstrapEntry(first.entryId)?.productId).toBe('prod-a');
    completeBootstrapEntry(first.entryId);

    const second = simulateExternalEntry({
      query: ANCHOR_SIMILAR_MESSAGE,
      productId: 'prod-a',
      entryId: 'entry-b',
      clientTurnId: 'turn-b',
    });

    expect(
      shouldHydrateBootstrapEntry({
        entryId: second.entryId,
        query: ANCHOR_SIMILAR_MESSAGE,
        messages: [],
      }),
    ).toBe('hydrate');
    expect(tryClaimBootstrapEntry(second.entryId)?.productId).toBe('prod-a');
  });

  it('B: different products with the same fixed action text both hydrate', () => {
    const first = simulateExternalEntry({
      query: ANCHOR_SIMILAR_MESSAGE,
      productId: 'prod-a',
      entryId: 'entry-a',
      clientTurnId: 'turn-a',
    });
    completeBootstrapEntry(first.entryId);

    const second = simulateExternalEntry({
      query: ANCHOR_SIMILAR_MESSAGE,
      productId: 'prod-b',
      entryId: 'entry-b',
      clientTurnId: 'turn-b',
    });

    const claimed = tryClaimBootstrapEntry(second.entryId);
    expect(claimed?.productId).toBe('prod-b');
    expect(
      resolveSendMessage({
        query: ANCHOR_SIMILAR_MESSAGE,
        source: 'anchor-action',
        explicitContext: { productId: claimed!.productId! },
        activeProductId: null,
      }).context,
    ).toEqual({ productId: 'prod-b' });
  });

  it('C: same homepage suggestion through two separate navigations both hydrate', () => {
    simulateExternalEntry({
      query: 'Herresko til løping',
      entryId: 'entry-a',
      clientTurnId: 'turn-a',
    });
    completeBootstrapEntry('entry-a');

    simulateExternalEntry({
      query: 'Herresko til løping',
      entryId: 'entry-b',
      clientTurnId: 'turn-b',
    });

    expect(
      shouldHydrateBootstrapEntry({
        entryId: 'entry-b',
        query: 'Herresko til løping',
        messages: [],
      }),
    ).toBe('hydrate');
  });

  it('D: same typed query through separate entries both hydrate', () => {
    simulateExternalEntry({
      query: 'Svart hettegenser',
      entryId: 'entry-a',
      clientTurnId: 'turn-a',
    });
    completeBootstrapEntry('entry-a');

    simulateExternalEntry({
      query: 'Svart hettegenser',
      entryId: 'entry-b',
      clientTurnId: 'turn-b',
    });

    expect(tryClaimBootstrapEntry('entry-b')).toMatchObject({
      query: 'Svart hettegenser',
    });
  });

  it('E: duplicate hydration effect for the same entry sends once', () => {
    simulateExternalEntry({
      query: 'Regnjakke',
      entryId: 'entry-a',
      clientTurnId: 'turn-a',
    });

    expect(tryClaimBootstrapEntry('entry-a')).not.toBeNull();
    expect(tryClaimBootstrapEntry('entry-a')).toBeNull();
  });

  it('F: Strict Mode equivalent duplicate claim is blocked', () => {
    simulateExternalEntry({
      query: 'Regnjakke',
      entryId: 'entry-a',
      clientTurnId: 'turn-a',
    });

    const first = tryClaimBootstrapEntry('entry-a');
    const second = tryClaimBootstrapEntry('entry-a');

    expect(first).not.toBeNull();
    expect(second).toBeNull();
  });

  it('G: completed entry does not hydrate again on refresh simulation', () => {
    simulateExternalEntry({
      query: 'Regnjakke',
      entryId: 'entry-a',
      clientTurnId: 'turn-a',
    });
    tryClaimBootstrapEntry('entry-a');
    completeBootstrapEntry('entry-a');

    expect(
      shouldHydrateBootstrapEntry({
        entryId: 'entry-a',
        query: 'Regnjakke',
        messages: [],
      }),
    ).toBe('skip');
  });

  it('H: pending entry productId is the source of truth for anchor context', () => {
    savePendingBootstrapEntry({
      entryId: 'entry-b',
      query: ANCHOR_SIMILAR_MESSAGE,
      productId: 'prod-b',
      clientTurnId: 'turn-b',
    });

    const preview = anchorPreviewFromPendingEntry(
      getPendingBootstrapEntry('entry-b')!,
    );

    expect(preview?.productId).toBe('prod-b');
  });

  it('I: failed bootstrap releases claim so a retry can reclaim the same entry', () => {
    simulateExternalEntry({
      query: 'Regnjakke',
      entryId: 'entry-a',
      clientTurnId: 'turn-a',
    });

    expect(tryClaimBootstrapEntry('entry-a')).not.toBeNull();
    releaseBootstrapEntryClaim('entry-a');

    expect(tryClaimBootstrapEntry('entry-a')).not.toBeNull();
  });

  it('J: missing pending entry is unavailable instead of silently hydrating', () => {
    expect(
      shouldHydrateBootstrapEntry({
        entryId: 'missing-entry',
        query: 'Regnjakke',
        messages: [],
      }),
    ).toBe('unavailable');
  });

  it('K: direct /chat?q= without entry can create a one-shot legacy bootstrap entry', () => {
    const legacy = createLegacyBootstrapEntry({ query: 'Herresko til løping' });

    expect(legacy.entryId).toBeTruthy();
    expect(
      shouldHydrateBootstrapEntry({
        entryId: legacy.entryId,
        query: 'Herresko til løping',
        messages: [],
      }),
    ).toBe('hydrate');
  });

  it('L: legacy mens URL bootstrap stores legacy shop context on pending entry', () => {
    const legacy = createLegacyBootstrapEntry({
      query: 'Herresko til løping',
      legacyShopCategory: 'mens',
      entryId: 'legacy-entry',
      clientTurnId: 'legacy-turn',
    });

    expect(legacy.legacyShopCategory).toBe('mens');
    expect(
      buildLegacyChatEntryUrl({
        query: 'Herresko til løping',
        entryId: 'legacy-entry',
        legacyShopCategory: 'mens',
      }),
    ).toContain('category=mens');
  });

  it('M: new generated entry URLs include entry but not category', () => {
    const url = buildChatEntryUrl({
      query: 'Herresko til løping',
      entryId: 'entry-a',
    });

    expect(url).toContain('entry=entry-a');
    expect(url).not.toContain('category=');
  });

  it('navigateToChatEntry stores pending payload and routes with entry param', () => {
    const push = vi.fn();
    navigateToChatEntry({ push } as never, { query: 'Herresko til løping' });

    expect(push).toHaveBeenCalledWith('/chat?q=Herresko+til+l%C3%B8ping&entry=entry-a');
    expect(getPendingBootstrapEntry('entry-a')).toMatchObject({
      query: 'Herresko til løping',
      clientTurnId: 'turn-a',
    });
  });

  it('clears bootstrap state on reset helper', () => {
    simulateExternalEntry({
      query: 'test',
      entryId: 'entry-a',
      clientTurnId: 'turn-a',
    });
    tryClaimBootstrapEntry('entry-a');

    clearBootstrapEntryState();

    expect(sessionStorage.getItem(CHAT_BOOTSTRAP_PENDING_KEY)).toBeNull();
    expect(sessionStorage.getItem(CHAT_BOOTSTRAP_CLAIMED_KEY)).toBeNull();
  });
});

describe('parseChatEntryBootstrap', () => {
  it('reads entry id from generated URLs', () => {
    expect(
      parseChatEntryBootstrap(
        new URLSearchParams('q=Herresko+til+l%C3%B8ping&entry=entry-a'),
      ),
    ).toMatchObject({
      query: 'Herresko til løping',
      entryId: 'entry-a',
      legacyShopCategory: undefined,
    });
  });
});
