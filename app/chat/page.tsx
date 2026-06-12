import { Suspense } from 'react';
import { ChatPageLayout } from '@/components/layout/chat-page-layout';
import { SearchChatView } from '@/components/search/search-chat-view';

export default function ChatPage() {
  return (
    <ChatPageLayout>
      <Suspense fallback={null}>
        <SearchChatView />
      </Suspense>
    </ChatPageLayout>
  );
}
