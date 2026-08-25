import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearPendingLegacyEntry,
  consumePendingLegacyEntry,
  savePendingLegacyEntry,
  shouldSubmitPendingLegacyEntry,
} from '@/lib/chat/conversation-entry-bridge';
import type { SearchChatMessageData } from '@/lib/chat/chat-messages';

describe('conversation-entry-bridge', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('stores and consumes a pending legacy entry once', () => {
    savePendingLegacyEntry({
      conversationId: 'conv-1',
      query: 'Svart hettegenser',
      shopCategory: 'mens',
      clientTurnId: 'turn-1',
    });

    expect(consumePendingLegacyEntry('conv-1')).toMatchObject({
      query: 'Svart hettegenser',
      clientTurnId: 'turn-1',
    });
    expect(consumePendingLegacyEntry('conv-1')).toBeNull();
  });

  it('skips pending submit when restored thread already contains the query', () => {
    savePendingLegacyEntry({
      conversationId: 'conv-1',
      query: 'Svart hettegenser',
      clientTurnId: 'turn-1',
    });

    const messages: SearchChatMessageData[] = [
      {
        id: 'user-1',
        role: 'user',
        content: 'Svart hettegenser',
      },
    ];

    expect(
      shouldSubmitPendingLegacyEntry({
        conversationId: 'conv-1',
        messages,
      }),
    ).toBeNull();
    expect(consumePendingLegacyEntry('conv-1')).toBeNull();
  });

  it('clears pending entry on reset helper', () => {
    savePendingLegacyEntry({
      conversationId: 'conv-1',
      query: 'test',
      clientTurnId: 'turn-1',
    });

    clearPendingLegacyEntry();
    expect(consumePendingLegacyEntry('conv-1')).toBeNull();
  });
});
