import type { ReactNode } from 'react';
import { ChatPageLayout } from '@/components/layout/chat-page-layout';
import { ChatSessionProvider } from '@/lib/chat/chat-session-provider';
import { SearchChatView } from '@/components/search/search-chat-view';

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <ChatSessionProvider>
      <ChatPageLayout>
        <SearchChatView />
      </ChatPageLayout>
      {children}
    </ChatSessionProvider>
  );
}
