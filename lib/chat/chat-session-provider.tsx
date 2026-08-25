'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useChatSession } from '@/lib/hooks/useChatSession';
import { parseChatEntryBootstrap } from '@/lib/chat/chat-entry';
import { conversationIdFromPath } from '@/lib/chat/chat-footer-visibility';

type ChatSessionValue = ReturnType<typeof useChatSession>;

const ChatSessionContext = createContext<ChatSessionValue | null>(null);

export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const conversationId = conversationIdFromPath(pathname);
  const entryBootstrap = conversationId
    ? { query: '', legacyShopCategory: undefined }
    : parseChatEntryBootstrap(searchParams);

  const session = useChatSession({
    conversationId,
    urlQuery: entryBootstrap.query,
    legacyShopCategory: entryBootstrap.legacyShopCategory,
  });

  return (
    <ChatSessionContext.Provider value={session}>
      {children}
    </ChatSessionContext.Provider>
  );
}

export function useChatSessionContext(): ChatSessionValue {
  const context = useContext(ChatSessionContext);
  if (!context) {
    throw new Error(
      'useChatSessionContext must be used within ChatSessionProvider',
    );
  }
  return context;
}
