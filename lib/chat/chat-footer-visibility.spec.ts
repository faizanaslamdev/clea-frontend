import { describe, expect, it } from 'vitest';
import {
  conversationIdFromPath,
  shouldHideChatFooter,
  shouldSkipConversationRestore,
} from '@/lib/chat/chat-footer-visibility';

describe('shouldHideChatFooter', () => {
  it('shows footer on fresh empty /chat', () => {
    expect(
      shouldHideChatFooter({
        messageCount: 0,
        urlQuery: '',
        isRestoring: false,
      }),
    ).toBe(false);
  });

  it('hides footer once chat history exists', () => {
    expect(
      shouldHideChatFooter({
        messageCount: 2,
        urlQuery: '',
        isRestoring: false,
      }),
    ).toBe(true);
  });

  it('hides footer on legacy entry query', () => {
    expect(
      shouldHideChatFooter({
        messageCount: 0,
        urlQuery: 'Svart hettegenser',
        isRestoring: false,
      }),
    ).toBe(true);
  });

  it('hides footer while restoring a conversation route', () => {
    expect(
      shouldHideChatFooter({
        messageCount: 0,
        urlQuery: '',
        conversationId: '22222222-2222-4222-8222-222222222222',
        isRestoring: true,
      }),
    ).toBe(true);
  });

  it('hides footer on conversation route even before restore completes', () => {
    expect(
      shouldHideChatFooter({
        messageCount: 0,
        urlQuery: '',
        conversationId: '22222222-2222-4222-8222-222222222222',
        isRestoring: true,
      }),
    ).toBe(true);
  });
});

describe('shouldSkipConversationRestore', () => {
  it('skips restore when optimistic local thread matches conversation', () => {
    expect(
      shouldSkipConversationRestore({
        conversationId: 'conv-1',
        sessionConversationId: 'conv-1',
        messageCount: 2,
        hasActiveTurn: true,
      }),
    ).toBe(true);
  });

  it('restores direct URL visits without local thread', () => {
    expect(
      shouldSkipConversationRestore({
        conversationId: 'conv-1',
        messageCount: 0,
        hasActiveTurn: false,
      }),
    ).toBe(false);
  });
});

describe('conversationIdFromPath', () => {
  it('extracts conversation id from chat route', () => {
    expect(conversationIdFromPath('/chat/abc-123')).toBe('abc-123');
    expect(conversationIdFromPath('/chat')).toBeUndefined();
  });
});
