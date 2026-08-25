import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildChatEntryUrl,
  buildLegacyChatEntryUrl,
  navigateToChatEntry,
  parseChatEntryBootstrap,
} from '@/lib/chat/chat-entry';
import { getPendingBootstrapEntry } from '@/lib/chat/chat-bootstrap-entry';

describe('buildChatEntryUrl', () => {
  it('A/B/C: homepage and landing suggestions include entry but omit category', () => {
    expect(
      buildChatEntryUrl({ query: 'Herresko til løping', entryId: 'entry-1' }),
    ).toBe('/chat?q=Herresko+til+l%C3%B8ping&entry=entry-1');
  });

  it('A/D: typed homepage and header searches use query+entry URLs', () => {
    expect(
      buildChatEntryUrl({ query: 'Svart hettegenser', entryId: 'entry-1' }),
    ).toBe('/chat?q=Svart+hettegenser&entry=entry-1');
  });

  it('returns bare /chat for empty query', () => {
    expect(buildChatEntryUrl({ query: '   ', entryId: 'entry-1' })).toBe('/chat');
  });

  it('never adds category for new navigations', () => {
    const url = buildChatEntryUrl({
      query: 'Herresko til løping',
      entryId: 'entry-1',
    });
    expect(url).not.toContain('category=');
  });
});

describe('navigateToChatEntry', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal('crypto', {
      randomUUID: vi
        .fn()
        .mockReturnValueOnce('entry-1')
        .mockReturnValueOnce('turn-1'),
    });
  });

  it('routes through the shared query+entry URL and stores pending payload', () => {
    const push = vi.fn();
    navigateToChatEntry({ push } as never, { query: 'Herresko til løping' });
    expect(push).toHaveBeenCalledWith(
      '/chat?q=Herresko+til+l%C3%B8ping&entry=entry-1',
    );
    expect(getPendingBootstrapEntry('entry-1')).toMatchObject({
      query: 'Herresko til løping',
      clientTurnId: 'turn-1',
    });
  });
});

describe('parseChatEntryBootstrap', () => {
  it('E: direct /chat?q= without legacy shop context', () => {
    const params = new URLSearchParams('q=Herresko+til+l%C3%B8ping');
    expect(parseChatEntryBootstrap(params)).toEqual({
      query: 'Herresko til løping',
      entryId: undefined,
      legacyShopCategory: undefined,
    });
  });

  it('F: legacy /chat?q=&category=mens remains supported', () => {
    const params = new URLSearchParams(
      'q=Herresko+til+l%C3%B8ping&category=mens',
    );
    expect(parseChatEntryBootstrap(params)).toEqual({
      query: 'Herresko til løping',
      entryId: undefined,
      legacyShopCategory: 'mens',
    });
  });

  it('G: legacy womens equivalent remains supported', () => {
    const params = new URLSearchParams('q=Sommerkjole&category=womens');
    expect(parseChatEntryBootstrap(params)).toEqual({
      query: 'Sommerkjole',
      entryId: undefined,
      legacyShopCategory: 'womens',
    });
  });

  it('M: generated URLs expose entry id', () => {
    const params = new URLSearchParams(
      'q=Herresko+til+l%C3%B8ping&entry=entry-1',
    );
    expect(parseChatEntryBootstrap(params).entryId).toBe('entry-1');
  });
});

describe('buildLegacyChatEntryUrl', () => {
  it('includes legacy category only for legacy incoming flows', () => {
    expect(
      buildLegacyChatEntryUrl({
        query: 'Herresko til løping',
        entryId: 'entry-1',
        legacyShopCategory: 'mens',
      }),
    ).toBe('/chat?q=Herresko+til+l%C3%B8ping&entry=entry-1&category=mens');
  });
});
