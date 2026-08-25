import { clearAnchorTurnContext } from '@/lib/chat/anchor-actions';
import { clearChatThreadPersistence } from '@/lib/chat/chat-thread-persistence';

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
  const sessionId = options.resetSessionId();
  return { sessionId };
}
