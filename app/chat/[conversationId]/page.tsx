import { Suspense } from 'react';
import { ChatPageLayout } from '@/components/layout/chat-page-layout';
import { SearchChatView } from '@/components/search/search-chat-view';

interface ConversationChatPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationChatPage({
  params,
}: ConversationChatPageProps) {
  const { conversationId } = await params;

  return (
    <ChatPageLayout>
      <Suspense fallback={null}>
        <SearchChatView conversationId={conversationId} />
      </Suspense>
    </ChatPageLayout>
  );
}
