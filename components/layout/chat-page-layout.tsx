'use client';

import type { ReactNode } from 'react';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { useChatSessionContext } from '@/lib/chat/chat-session-provider';
import { cn } from '@/lib/utils';

interface ChatPageLayoutProps {
  children: ReactNode;
}

export function ChatPageLayout({ children }: ChatPageLayoutProps) {
  const { hideFooter } = useChatSessionContext();

  return (
    <>
      <Header />
      <main className={cn('min-h-screen bg-background', 'chat-layout')}>
        {children}
      </main>
      {!hideFooter && <Footer showCompareCta={false} />}
    </>
  );
}
