import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ChatPageLayout } from '@/components/layout/chat-page-layout';
import { ChatSessionProvider } from '@/lib/chat/chat-session-provider';
import { SearchChatView } from '@/components/search/search-chat-view';

export const metadata: Metadata = {
  title: 'AI-moteassistent – spør Clea',
  description:
    'Beskriv hva du leter etter, som «noe pent til julebord under 1500 kr», og få forslag fra 15+ nettbutikker med priser sammenlignet.',
  alternates: { canonical: '/chat' },
};

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
