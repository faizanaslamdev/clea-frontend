import { describe, expect, it } from 'vitest';
import type { ChatTurnResult } from '@/lib/api/chat-types';
import { isPendingAssistantMessage } from '@/lib/chat/chat-messages';
import { chatSessionReducer } from '@/lib/chat/chat-session-reducer';
import {
  createTurnIdentity,
  initialChatSessionState,
} from '@/lib/chat/chat-session-types';

const TURN: ChatTurnResult = {
  reply: 'Her er noen produkter.',
  intent: 'product_search',
  products: [],
  total: 0,
  limit: 12,
  offset: 0,
  hasMore: false,
  usedFallback: false,
};

describe('chatSessionReducer TURN_BEGIN', () => {
  it('appends a linked user and pending assistant pair', () => {
    const identity = createTurnIdentity();
    const next = chatSessionReducer(initialChatSessionState, {
      type: 'TURN_BEGIN',
      identity,
      query: 'svart kjole',
    });

    expect(next.messages).toHaveLength(2);
    expect(next.messages[0]?.role).toBe('user');
    expect(next.messages[0]?.turnId).toBe(identity.turnId);
    expect(next.messages[1]?.id).toBe(identity.assistantMessageId);
    expect(isPendingAssistantMessage(next.messages[1]!)).toBe(true);
    expect(next.activeTurn?.id).toBe(identity.turnId);
  });

  it('does not duplicate an in-flight turn for the same query', () => {
    const identity = createTurnIdentity();
    const started = chatSessionReducer(initialChatSessionState, {
      type: 'TURN_BEGIN',
      identity,
      query: 'hello',
    });

    const retried = chatSessionReducer(started, {
      type: 'TURN_BEGIN',
      identity: createTurnIdentity(),
      query: 'hello',
    });

    expect(retried.messages).toHaveLength(2);
    expect(retried.activeTurn?.assistantMessageId).toBe(
      identity.assistantMessageId,
    );
  });
});

describe('chatSessionReducer TURN_SUCCESS', () => {
  it('completes the pending assistant while preserving its id', () => {
    const identity = createTurnIdentity();
    const started = chatSessionReducer(initialChatSessionState, {
      type: 'TURN_BEGIN',
      identity,
      query: 'hello',
    });

    const completed = chatSessionReducer(started, {
      type: 'TURN_SUCCESS',
      turnId: identity.turnId,
      query: 'hello',
      result: TURN,
    });

    expect(completed.activeTurn).toBeNull();
    expect(completed.messages[1]?.id).toBe(identity.assistantMessageId);
    expect(completed.messages[1]?.status).toBe('complete');
    expect(completed.messages[1]?.content).toBe(TURN.reply);
  });
});

describe('chatSessionReducer LOAD_MORE', () => {
  it('appends unique products and advances pagination state', () => {
    const identity = createTurnIdentity();
    const started = chatSessionReducer(initialChatSessionState, {
      type: 'TURN_BEGIN',
      identity,
      query: 'shirt from Ralph Lauren',
    });
    const completed = chatSessionReducer(started, {
      type: 'TURN_SUCCESS',
      turnId: identity.turnId,
      query: 'shirt from Ralph Lauren',
      result: {
        ...TURN,
        intent: 'product_search',
        products: [{ id: 'p1' }, { id: 'p2' }] as ChatTurnResult['products'],
        total: 10,
        hasMore: true,
        catalogQuery: {
          q: 'shirt',
          merchantId: '384513',
          offset: 0,
        },
      },
    });

    const messageId = completed.messages[1]!.id;
    const loaded = chatSessionReducer(completed, {
      type: 'LOAD_MORE_SUCCESS',
      messageId,
      catalogQuery: {
        q: 'shirt',
        merchantId: '384513',
        offset: 2,
      },
      result: {
        ...TURN,
        intent: 'product_search',
        products: [{ id: 'p2' }, { id: 'p3' }] as ChatTurnResult['products'],
        total: 10,
        hasMore: true,
        offset: 2,
        catalogQuery: {
          q: 'shirt',
          merchantId: '384513',
          offset: 2,
        },
      },
    });

    expect(loaded.messages[1]?.products?.map((product) => product.id)).toEqual([
      'p1',
      'p2',
      'p3',
    ]);
    expect(loaded.messages[1]?.searchHasMore).toBe(true);
    expect(loaded.messages[1]?.catalogQuery?.offset).toBe(2);
  });
});

describe('chatSessionReducer RESTORE_SUCCESS', () => {
  it('replaces messages from server restore and clears in-flight state', () => {
    const identity = createTurnIdentity();
    const started = chatSessionReducer(initialChatSessionState, {
      type: 'TURN_BEGIN',
      identity,
      query: 'pending',
    });

    const restored = chatSessionReducer(started, {
      type: 'RESTORE_SUCCESS',
      messages: [
        {
          id: 'user-restored',
          role: 'user',
          content: 'hello',
        },
      ],
    });

    expect(restored.messages).toHaveLength(1);
    expect(restored.activeTurn).toBeNull();
    expect(restored.loadingMoreMessageId).toBeNull();
  });
});

describe('chatSessionReducer TURN_ERROR', () => {
  it('replaces the pending assistant with an error message', () => {
    const identity = createTurnIdentity();
    const started = chatSessionReducer(initialChatSessionState, {
      type: 'TURN_BEGIN',
      identity,
      query: 'hello',
    });

    const failed = chatSessionReducer(started, {
      type: 'TURN_ERROR',
      turnId: identity.turnId,
      errorMessage: 'Noe gikk galt.',
    });

    expect(failed.activeTurn).toBeNull();
    expect(failed.messages[1]?.content).toBe('Noe gikk galt.');
  });
});
