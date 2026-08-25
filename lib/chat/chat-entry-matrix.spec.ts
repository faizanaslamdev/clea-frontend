import { describe, expect, it } from 'vitest';
import { resolveSendMessage } from '@/lib/chat/resolve-send-message';
import {
  buildChatEntryUrl,
  parseChatEntryBootstrap,
} from '@/lib/chat/chat-entry';
import {
  buildUrlHydrationSignature,
  markUrlQueryHydrated,
  shouldHydrateUrlQuery,
} from '@/lib/chat/chat-thread-persistence';

/**
 * Entry-point contract matrix (unit-level).
 * Full hook/e2e coverage lives alongside these invariants.
 */
describe('chat entry matrix contracts', () => {
  it('A homepage typed query: query-only URL, no category param', () => {
    expect(buildChatEntryUrl({ query: 'Svart hettegenser' })).toBe(
      '/chat?q=Svart+hettegenser',
    );
  });

  it('B homepage suggestion: query-only URL even when suggestions were fetched for mens', () => {
    const url = buildChatEntryUrl({ query: 'Herresko til løping' });
    expect(url).toBe('/chat?q=Herresko+til+l%C3%B8ping');
    expect(url).not.toContain('category=');
  });

  it('C empty-chat suggestion uses the same query-only URL shape', () => {
    expect(buildChatEntryUrl({ query: 'Regnjakke' })).not.toContain('category=');
  });

  it('D header search uses query-only URL', () => {
    expect(buildChatEntryUrl({ query: 'Vinterjakke' })).toBe(
      '/chat?q=Vinterjakke',
    );
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

  it('K refresh before promotion: signature blocks duplicate hydration', () => {
    const signature = buildUrlHydrationSignature('Herresko til løping');
    expect(
      shouldHydrateUrlQuery({
        query: 'Herresko til løping',
        messages: [],
        hydratedSignatures: [signature],
      }),
    ).toBe(false);
  });

  it('K refresh after promotion: conversation path ignores q param bootstrap', () => {
    expect(
      parseChatEntryBootstrap(new URLSearchParams('')).query,
    ).toBe('');
  });

  it('L legacy and generic signatures differ to avoid cross-mode duplicate suppression', () => {
    expect(buildUrlHydrationSignature('Herresko til løping')).toBe(
      'herresko til løping|',
    );
    expect(buildUrlHydrationSignature('Herresko til løping', 'mens')).toBe(
      'herresko til løping|mens',
    );
  });

  it('M Strict Mode / effect re-run: signature recorded before async send', () => {
    const query = 'Herresko til løping';

    expect(
      shouldHydrateUrlQuery({
        query,
        messages: [],
        hydratedSignatures: [],
      }),
    ).toBe(true);

    const signatures = markUrlQueryHydrated(query);

    expect(
      shouldHydrateUrlQuery({
        query,
        messages: [],
        hydratedSignatures: signatures,
      }),
    ).toBe(false);
  });

  it('N explicit legacy shop context uses distinct hydration signature', () => {
    expect(
      shouldHydrateUrlQuery({
        query: 'Black hoodie',
        shopCategory: 'mens',
        messages: [],
        hydratedSignatures: [buildUrlHydrationSignature('Black hoodie')],
      }),
    ).toBe(true);
  });
});
