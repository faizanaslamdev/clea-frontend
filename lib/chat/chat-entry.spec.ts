import { describe, expect, it, vi } from 'vitest';
import {
  buildChatEntryUrl,
  navigateToChatEntry,
  parseChatEntryBootstrap,
} from '@/lib/chat/chat-entry';

describe('buildChatEntryUrl', () => {
  it('A/B/C: homepage and landing suggestions omit category from new URLs', () => {
    expect(buildChatEntryUrl({ query: 'Herresko til løping' })).toBe(
      '/chat?q=Herresko+til+l%C3%B8ping',
    );
  });

  it('A/D: typed homepage and header searches use query-only URLs', () => {
    expect(buildChatEntryUrl({ query: 'Svart hettegenser' })).toBe(
      '/chat?q=Svart+hettegenser',
    );
  });

  it('returns bare /chat for empty query', () => {
    expect(buildChatEntryUrl({ query: '   ' })).toBe('/chat');
  });

  it('never adds category for new navigations', () => {
    const url = buildChatEntryUrl({ query: 'Herresko til løping' });
    expect(url).not.toContain('category=');
  });
});

describe('navigateToChatEntry', () => {
  it('routes through the shared query-only entry URL', () => {
    const push = vi.fn();
    navigateToChatEntry({ push } as never, { query: 'Herresko til løping' });
    expect(push).toHaveBeenCalledWith('/chat?q=Herresko+til+l%C3%B8ping');
  });
});

describe('parseChatEntryBootstrap', () => {
  it('E: direct /chat?q= without legacy shop context', () => {
    const params = new URLSearchParams('q=Herresko+til+l%C3%B8ping');
    expect(parseChatEntryBootstrap(params)).toEqual({
      query: 'Herresko til løping',
      legacyShopCategory: undefined,
    });
  });

  it('F: legacy /chat?q=&category=mens remains supported', () => {
    const params = new URLSearchParams(
      'q=Herresko+til+l%C3%B8ping&category=mens',
    );
    expect(parseChatEntryBootstrap(params)).toEqual({
      query: 'Herresko til løping',
      legacyShopCategory: 'mens',
    });
  });

  it('G: legacy womens equivalent remains supported', () => {
    const params = new URLSearchParams('q=Sommerkjole&category=womens');
    expect(parseChatEntryBootstrap(params)).toEqual({
      query: 'Sommerkjole',
      legacyShopCategory: 'womens',
    });
  });
});
