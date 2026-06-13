'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { cn } from '@/lib/utils';

interface ChatPageLayoutProps {
  children: React.ReactNode;
}

function ChatPageLayoutInner({ children }: ChatPageLayoutProps) {
  const searchParams = useSearchParams();
  const inChatSession = Boolean(searchParams.get('q')?.trim());

  return (
    <>
      <Header />
      <main className={cn('min-h-screen bg-background', 'chat-layout')}>
        {children}
      </main>
      {!inChatSession && <Footer showCompareCta={false} />}
    </>
  );
}

export function ChatPageLayout({ children }: ChatPageLayoutProps) {
  return (
    <Suspense fallback={<ChatPageLayoutFallback>{children}</ChatPageLayoutFallback>}>
      <ChatPageLayoutInner>{children}</ChatPageLayoutInner>
    </Suspense>
  );
}

function ChatPageLayoutFallback({ children }: ChatPageLayoutProps) {
  return (
    <>
      <Header />
      <main className={cn('min-h-screen bg-background', 'chat-layout')}>
        {children}
      </main>
      <Footer showCompareCta={false} />
    </>
  );
}
