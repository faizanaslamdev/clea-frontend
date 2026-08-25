import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resolveSendMessage } from '@/lib/chat/resolve-send-message';
import {
  buildChatEntryUrl,
  parseChatEntryBootstrap,
} from '@/lib/chat/chat-entry';
import {
  completeBootstrapEntry,
  savePendingBootstrapEntry,
  shouldHydrateBootstrapEntry,
  tryClaimBootstrapEntry,
} from '@/lib/chat/chat-bootstrap-entry';

/**
 * Entry-point contract matrix (unit-level).
 * Full hook/e2e coverage lives alongside these invariants.
 */
describe('chat entry matrix contracts', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('A homepage typed query: query+entry URL, no category param', () => {
    expect(
      buildChatEntryUrl({ query: 'Svart hettegenser', entryId: 'entry-1' }),
    ).toBe('/chat?q=Svart+hettegenser&entry=entry-1');
  });

  it('B homepage suggestion: query+entry URL even when suggestions were fetched for mens', () => {
    const url = buildChatEntryUrl({
      query: 'Herresko til løping',
      entryId: 'entry-1',
    });
    expect(url).toBe('/chat?q=Herresko+til+l%C3%B8ping&entry=entry-1');
    expect(url).not.toContain('category=');
  });

  it('C empty-chat suggestion uses the same query+entry URL shape', () => {
    expect(
      buildChatEntryUrl({ query: 'Regnjakke', entryId: 'entry-1' }),
    ).not.toContain('category=');
  });

  it('D header search uses query+entry URL', () => {
    expect(
      buildChatEntryUrl({ query: 'Vinterjakke', entryId: 'entry-1' }),
    ).toBe('/chat?q=Vinterjakke&entry=entry-1');
  });

  it('E direct /chat?q= bootstrap has no legacy shop category', () => {
    expect(
      parseChatEntryBootstrap(new URLSearchParams('q=Herresko+til+l%C3%B8ping')),
    ).toMatchObject({
      query: 'Herresko til løping',
      legacyShopCategory: undefined,
    });
  });

  it('F legacy mens URL maps category to legacyShopCategory', () => {
    expect(
      parseChatEntryBootstrap(
        new URLSearchParams('q=Herresko+til+l%C3%B8ping&category=mens'),
      ).legacyShopCategory,
    ).toBe('mens');
  });

  it('G legacy womens URL maps category to legacyShopCategory', () => {
    expect(
      parseChatEntryBootstrap(
        new URLSearchParams('q=Sommerkjole&category=womens'),
      ).legacyShopCategory,
    ).toBe('womens');
  });

  it('H in-thread suggestion clears anchor and does not inject shopCategory', () => {
    const resolved = resolveSendMessage({
      query: 'Under 500 kr',
      source: 'suggestion',
      activeProductId: 'prod-1',
      suggestionSourceAnchorProductId: 'prod-1',
    });

    expect(resolved.context).toBeUndefined();
    expect(resolved.clearActiveProduct).toBe(true);
  });

  it('I clarification-style suggestion is a plain composer-equivalent send', () => {
    const resolved = resolveSendMessage({
      query: 'Casual',
      source: 'suggestion',
      activeProductId: null,
    });

    expect(resolved.context).toBeUndefined();
  });

  it('J product chat CTA preserves productId context on hydration', () => {
    const resolved = resolveSendMessage({
      query: 'Vis lignende produkter',
      source: 'anchor-action',
      explicitContext: { productId: 'prod-99' },
      activeProductId: null,
    });

    expect(resolved.context).toEqual({ productId: 'prod-99' });
  });

  it('K refresh before promotion: same entry claim blocks duplicate hydration', () => {
    savePendingBootstrapEntry({
      entryId: 'entry-1',
      query: 'Herresko til løping',
      clientTurnId: 'turn-1',
    });
    tryClaimBootstrapEntry('entry-1');

    expect(
      shouldHydrateBootstrapEntry({
        entryId: 'entry-1',
        query: 'Herresko til løping',
        messages: [],
      }),
    ).toBe('skip');
  });

  it('K refresh after promotion: conversation path ignores q param bootstrap', () => {
    expect(
      parseChatEntryBootstrap(new URLSearchParams('')).query,
    ).toBe('');
  });

  it('L repeat intentional same query uses a new entry id and hydrates again', () => {
    savePendingBootstrapEntry({
      entryId: 'entry-1',
      query: 'Herresko til løping',
      clientTurnId: 'turn-1',
    });
    completeBootstrapEntry('entry-1');

    savePendingBootstrapEntry({
      entryId: 'entry-2',
      query: 'Herresko til løping',
      clientTurnId: 'turn-2',
    });

    expect(
      shouldHydrateBootstrapEntry({
        entryId: 'entry-2',
        query: 'Herresko til løping',
        messages: [],
      }),
    ).toBe('hydrate');
  });

  it('M Strict Mode / effect re-run: entry claim recorded before async send', () => {
    savePendingBootstrapEntry({
      entryId: 'entry-1',
      query: 'Herresko til løping',
      clientTurnId: 'turn-1',
    });

    expect(
      shouldHydrateBootstrapEntry({
        entryId: 'entry-1',
        query: 'Herresko til løping',
        messages: [],
      }),
    ).toBe('hydrate');

    expect(tryClaimBootstrapEntry('entry-1')).not.toBeNull();

    expect(
      shouldHydrateBootstrapEntry({
        entryId: 'entry-1',
        query: 'Herresko til løping',
        messages: [],
      }),
    ).toBe('skip');
  });

  it('N explicit legacy shop context is stored on the pending bootstrap entry', () => {
    savePendingBootstrapEntry({
      entryId: 'entry-legacy',
      query: 'Black hoodie',
      legacyShopCategory: 'mens',
      clientTurnId: 'turn-legacy',
    });

    expect(
      shouldHydrateBootstrapEntry({
        entryId: 'entry-legacy',
        query: 'Black hoodie',
        messages: [],
      }),
    ).toBe('hydrate');
  });
});
