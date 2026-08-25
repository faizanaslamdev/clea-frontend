import { beforeEach, describe, expect, it, vi } from 'vitest';
import { performChatReset } from '@/lib/chat/chat-reset';

vi.mock('@/lib/chat/conversation-session', async () => {
  const actual = await vi.importActual<typeof import('@/lib/chat/conversation-session')>(
    '@/lib/chat/conversation-session',
  );
  return {
    ...actual,
    createConversationSession: vi.fn(),
  };
});

import { createConversationSession } from '@/lib/chat/conversation-session';

describe('performChatReset', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('does not create a conversation during reset', () => {
    performChatReset({
      resetSessionId: () => 'sess_new',
    });

    expect(createConversationSession).not.toHaveBeenCalled();
  });

  it('clears pending legacy entry without creating conversations', () => {
    sessionStorage.setItem(
      'clea-chat-pending-entry-v1',
      JSON.stringify({
        version: 1,
        conversationId: 'conv-1',
        query: 'test',
        clientTurnId: 'turn-1',
      }),
    );

    performChatReset({
      resetSessionId: () => 'sess_new',
    });

    expect(createConversationSession).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('clea-chat-pending-entry-v1')).toBeNull();
  });
});
