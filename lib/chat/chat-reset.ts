import { clearAnchorTurnContext } from '@/lib/chat/anchor-actions';

export interface ChatResetOptions {
  resetSessionId: () => string;
  clearAnchor?: () => void;
}

export interface ChatResetResult {
  sessionId: string;
}

export function performChatReset(options: ChatResetOptions): ChatResetResult {
  (options.clearAnchor ?? clearAnchorTurnContext)();
  const sessionId = options.resetSessionId();
  return { sessionId };
}
