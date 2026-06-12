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
