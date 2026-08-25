import { describe, expect, it } from 'vitest';
import { mapRestoreConversationToMessages } from '@/lib/chat/restore-conversation-messages';
import type { RestoreConversationResponse } from '@/lib/api/chat-types';

describe('mapRestoreConversationToMessages', () => {
  it('maps ordered turns into UI messages with catalog state', () => {
    const restored: RestoreConversationResponse = {
      conversationId: 'conv-1',
      locale: 'nb',
      activeSearchIntent: {},
      pendingClarifySlots: null,
      hasMoreCatalog: true,
      turns: [
        {
          seq: 1,
          role: 'user',
          message: 'Treningsklær',
          clientTurnId: 'client-1',
        },
        {
          seq: 2,
          role: 'assistant',
          message: 'Her er noen produkter.',
          reply: 'Her er noen produkter.',
          intent: 'product_search',
          products: [],
          total: 24,
          limit: 12,
          offset: 0,
          hasMore: true,
          catalogQuery: { q: 'treningsklær', offset: 0 },
        },
      ],
    };

    const messages = mapRestoreConversationToMessages(restored);

    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({
      role: 'user',
      content: 'Treningsklær',
      id: 'client-1',
    });
    expect(messages[1]).toMatchObject({
      role: 'assistant',
      status: 'complete',
      searchHasMore: true,
      catalogQuery: { q: 'treningsklær', offset: 0 },
      query: 'Treningsklær',
    });
  });
});
