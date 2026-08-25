'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useChatSession } from '@/lib/hooks/useChatSession';
import { conversationIdFromPath } from '@/lib/chat/chat-footer-visibility';
import { parseShopCategory } from '@/lib/chat/shop-category';

type ChatSessionValue = ReturnType<typeof useChatSession>;

const ChatSessionContext = createContext<ChatSessionValue | null>(null);

export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const conversationId = conversationIdFromPath(pathname);
  const urlQuery = conversationId
    ? ''
    : (searchParams.get('q')?.trim() ?? '');
  const urlShopCategory = parseShopCategory(searchParams.get('category'));

  const session = useChatSession({
    conversationId,
    urlQuery,
    urlShopCategory,
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
