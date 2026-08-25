import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { shouldSkipConversationRestore } from '@/lib/chat/chat-footer-visibility';
import {
  EMPTY_CHAT_ENTRY_BOOTSTRAP,
  readEntryBootstrapFromLocation,
  resolveChatRouteParams,
} from '@/lib/chat/chat-route-params';

describe('resolveChatRouteParams', () => {
  it('clears entry bootstrap once a conversation route is active', () => {
    expect(
      resolveChatRouteParams({
        pathname: '/chat/conv-123',
        entryBootstrap: {
          query: 'Vis lignende produkter',
          entryId: 'entry-1',
          legacyShopCategory: undefined,
        },
      }),
    ).toEqual({
      conversationId: 'conv-123',
      ...EMPTY_CHAT_ENTRY_BOOTSTRAP,
    });
  });

  it('preserves bootstrap params on the legacy entry route', () => {
    expect(
      resolveChatRouteParams({
        pathname: '/chat',
        entryBootstrap: {
          query: 'Herresko til løping',
          entryId: 'entry-1',
          legacyShopCategory: 'mens',
        },
      }),
    ).toEqual({
      conversationId: undefined,
      query: 'Herresko til løping',
      entryId: 'entry-1',
      legacyShopCategory: 'mens',
    });
  });
});

describe('readEntryBootstrapFromLocation', () => {
  it('parses q and entry params from a location search string', () => {
    expect(
      readEntryBootstrapFromLocation(
        '?q=Herresko+til+l%C3%B8ping&entry=entry-1',
      ),
    ).toMatchObject({
      query: 'Herresko til løping',
      entryId: 'entry-1',
    });
  });
});

describe('promotion handoff restore contract', () => {
  it('B/E: self-created handoff keeps local thread and skips server restore', () => {
    expect(
      shouldSkipConversationRestore({
        conversationId: 'conv-1',
        sessionConversationId: 'conv-1',
        messageCount: 2,
        hasActiveTurn: true,
      }),
    ).toBe(true);
  });

  it('F/G: direct conversation visit without local thread restores from server', () => {
    expect(
      shouldSkipConversationRestore({
        conversationId: 'conv-1',
        messageCount: 0,
        hasActiveTurn: false,
      }),
    ).toBe(false);
  });
});

describe('stable shell architecture contract', () => {
  it('A: layout owns SearchChatView while pages are route anchors only', () => {
    const root = join(process.cwd(), 'app/chat');
    const layoutSource = readFileSync(join(root, 'layout.tsx'), 'utf8');
    const pageSource = readFileSync(join(root, 'page.tsx'), 'utf8');
    const conversationPageSource = readFileSync(
      join(root, '[conversationId]/page.tsx'),
      'utf8',
    );

    expect(layoutSource).toContain('SearchChatView');
    expect(pageSource).not.toContain('SearchChatView');
    expect(conversationPageSource).not.toContain('SearchChatView');
  });

  it('L: search-param Suspense is scoped to the bridge, not the visible shell', () => {
    const providerSource = readFileSync(
      join(process.cwd(), 'lib/chat/chat-session-provider.tsx'),
      'utf8',
    );
    const layoutSource = readFileSync(
      join(process.cwd(), 'app/chat/layout.tsx'),
      'utf8',
    );

    expect(providerSource).toContain('ChatSearchParamsBridge');
    expect(providerSource).toMatch(
      /<Suspense fallback=\{null\}>\s*<ChatSearchParamsBridge/,
    );
    expect(layoutSource).not.toContain('Suspense');
  });
});
