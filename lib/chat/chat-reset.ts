import { clearAnchorTurnContext } from '@/lib/chat/anchor-actions';
import { clearChatThreadPersistence } from '@/lib/chat/chat-thread-persistence';
import { clearPendingLegacyEntry } from '@/lib/chat/conversation-entry-bridge';
import { clearAnonymousTokens } from '@/lib/chat/conversation-token-store';

export interface ChatResetOptions {
  resetSessionId: () => string;
  clearAnchor?: () => void;
  clearThreadPersistence?: () => void;
}

export interface ChatResetResult {
  sessionId: string;
}

export function performChatReset(options: ChatResetOptions): ChatResetResult {
  (options.clearAnchor ?? clearAnchorTurnContext)();
  (options.clearThreadPersistence ?? clearChatThreadPersistence)();
  clearPendingLegacyEntry();
  clearAnonymousTokens();
  const sessionId = options.resetSessionId();
  return { sessionId };
}
