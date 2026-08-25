import { Suspense, type ReactNode } from 'react';
import { ChatPageLayout } from '@/components/layout/chat-page-layout';
import { ChatSessionProvider } from '@/lib/chat/chat-session-provider';

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ChatSessionProvider>
        <ChatPageLayout>{children}</ChatPageLayout>
      </ChatSessionProvider>
    </Suspense>
  );
}
