import type { ChatEntryBootstrap } from '@/lib/chat/chat-entry';
import { parseChatEntryBootstrap } from '@/lib/chat/chat-entry';
import { conversationIdFromPath } from '@/lib/chat/chat-footer-visibility';

export const EMPTY_CHAT_ENTRY_BOOTSTRAP: ChatEntryBootstrap = {
  query: '',
  entryId: undefined,
  legacyShopCategory: undefined,
};

export function readEntryBootstrapFromLocation(
  search = typeof window !== 'undefined' ? window.location.search : '',
): ChatEntryBootstrap {
  if (!search) {
    return EMPTY_CHAT_ENTRY_BOOTSTRAP;
  }

  return parseChatEntryBootstrap(new URLSearchParams(search));
}

export interface ChatRouteParams extends ChatEntryBootstrap {
  conversationId?: string;
}

export function resolveChatRouteParams(input: {
  pathname: string;
  entryBootstrap: ChatEntryBootstrap;
}): ChatRouteParams {
  const conversationId = conversationIdFromPath(input.pathname);
  if (conversationId) {
    return {
      conversationId,
      ...EMPTY_CHAT_ENTRY_BOOTSTRAP,
    };
  }

  return {
    conversationId: undefined,
    ...input.entryBootstrap,
  };
}
