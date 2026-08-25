import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatSessionReducer } from '@/lib/chat/chat-session-reducer';
import {
  createTurnIdentity,
  initialChatSessionState,
} from '@/lib/chat/chat-session-types';
import {
  shouldHideChatFooter,
  shouldSkipConversationRestore,
} from '@/lib/chat/chat-footer-visibility';

const createConversation = vi.fn();
const sendConversationTurn = vi.fn();
const restoreConversationSession = vi.fn();

vi.mock('@/lib/chat/conversation-session', () => ({
  createConversationSession: (...args: unknown[]) => createConversation(...args),
  resolveConversationSession: vi.fn(() => null),
  restoreConversationSession: (...args: unknown[]) =>
    restoreConversationSession(...args),
  sendConversationTurn: (...args: unknown[]) => sendConversationTurn(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

describe('lazy conversation lifecycle helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('optimistic first send begins UI before conversation creation', () => {
    const identity = createTurnIdentity();
    const started = chatSessionReducer(initialChatSessionState, {
      type: 'TURN_BEGIN',
      identity,
      query: 'Black hoodie',
    });

    expect(started.messages).toHaveLength(2);
    expect(started.activeTurn?.clientTurnId).toBe(identity.turnId);
    expect(createConversation).not.toHaveBeenCalled();
  });

  it('hides footer as soon as optimistic messages exist on /chat', () => {
    expect(
      shouldHideChatFooter({
        messageCount: 2,
        urlQuery: '',
        isRestoring: false,
      }),
    ).toBe(true);
  });

  it('skips server restore during in-flight optimistic navigation handoff', () => {
    expect(
      shouldSkipConversationRestore({
        conversationId: 'conv-1',
        sessionConversationId: 'conv-1',
        messageCount: 2,
        hasActiveTurn: true,
      }),
    ).toBe(true);
  });

  it('retry reuses the same clientTurnId for an in-flight turn', () => {
    const identity = createTurnIdentity();
    const started = chatSessionReducer(initialChatSessionState, {
      type: 'TURN_BEGIN',
      identity,
      query: 'Black hoodie',
    });

    expect(started.activeTurn?.clientTurnId).toBe(identity.turnId);
    expect(
      chatSessionReducer(started, {
        type: 'TURN_BEGIN',
        identity: createTurnIdentity(),
        query: 'Black hoodie',
      }).messages,
    ).toHaveLength(2);
  });

  it('keeps activeTurn after create/turn failure so retry can reuse clientTurnId', () => {
    const identity = createTurnIdentity();
    const started = chatSessionReducer(initialChatSessionState, {
      type: 'TURN_BEGIN',
      identity,
      query: 'Black hoodie',
    });
    const failed = chatSessionReducer(started, {
      type: 'TURN_ERROR',
      turnId: identity.turnId,
      errorMessage: 'Feil',
    });

    expect(failed.activeTurn?.clientTurnId).toBe(identity.turnId);
    expect(failed.messages.filter((m) => m.role === 'user')).toHaveLength(1);
  });

  it('skips restore when optimistic handoff already holds the conversation thread', () => {
    expect(
      shouldSkipConversationRestore({
        conversationId: 'conv-1',
        sessionConversationId: 'conv-1',
        messageCount: 2,
        hasActiveTurn: true,
      }),
    ).toBe(true);
    expect(
      shouldSkipConversationRestore({
        conversationId: 'conv-1',
        sessionConversationId: 'conv-1',
        messageCount: 2,
        hasActiveTurn: false,
      }),
    ).toBe(true);
  });
});

describe('New Chat reset expectations', () => {
  it('shows footer again on empty /chat after reset state', () => {
    expect(
      shouldHideChatFooter({
        messageCount: 0,
        urlQuery: '',
        isRestoring: false,
      }),
    ).toBe(false);
  });
});
