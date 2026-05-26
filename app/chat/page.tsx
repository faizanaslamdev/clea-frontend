import { Suspense } from 'react';
import { ChatPageLayout } from '@/components/layout/chat-page-layout';
import { SearchChatView } from '@/components/search/search-chat-view';
import { LoadingBlock } from '@/components/shared/loading-block';

function ChatPageFallback() {
  return (
    <div className="section-container py-8">
      <LoadingBlock className="mb-6 h-24" />
      <LoadingBlock className="h-64" />
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatPageLayout>
      <Suspense fallback={<ChatPageFallback />}>
        <SearchChatView />
      </Suspense>
    </ChatPageLayout>
  );
}
