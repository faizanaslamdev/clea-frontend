import type { ChatTurnContext } from '@/lib/api/chat-types';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import type { SearchChatMessageData } from '@/lib/chat/chat-messages';
import type { SendMessageSource } from '@/lib/chat/resolve-send-message';

/** Stable identifiers for one user → assistant exchange. */
export interface TurnIdentity {
  turnId: string;
  userMessageId: string;
  assistantMessageId: string;
}

export interface ActiveTurn {
  id: string;
  query: string;
  assistantMessageId: string;
}

export interface ChatSessionState {
  messages: SearchChatMessageData[];
  activeTurn: ActiveTurn | null;
  activeProductId: string | null;
  loadingMoreMessageId: string | null;
}

export const initialChatSessionState: ChatSessionState = {
  messages: [],
  activeTurn: null,
  activeProductId: null,
  loadingMoreMessageId: null,
};

export interface SendMessageInput {
  query: string;
  source?: SendMessageSource;
  context?: ChatTurnContext;
  anchorPreview?: AnchorPreview;
  persistAnchor?: boolean;
  suggestionSourceAnchorProductId?: string;
}

export function createTurnIdentity(): TurnIdentity {
  return {
    turnId: crypto.randomUUID(),
    userMessageId: crypto.randomUUID(),
    assistantMessageId: crypto.randomUUID(),
  };
}
