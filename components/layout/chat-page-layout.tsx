'use client';

import { Suspense, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { useChatSessionContext } from '@/lib/chat/chat-session-provider';
import { conversationIdFromPath } from '@/lib/chat/chat-footer-visibility';
import { cn } from '@/lib/utils';

interface ChatPageLayoutProps {
  children: ReactNode;
}

function ChatPageLayoutInner({ children }: ChatPageLayoutProps) {
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

export function ChatPageLayout({ children }: ChatPageLayoutProps) {
  return (
    <Suspense fallback={<ChatPageLayoutFallback>{children}</ChatPageLayoutFallback>}>
      <ChatPageLayoutInner>{children}</ChatPageLayoutInner>
    </Suspense>
  );
}

function ChatPageLayoutFallback({ children }: ChatPageLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hideFooter =
    Boolean(conversationIdFromPath(pathname)) ||
    Boolean(searchParams.get('q')?.trim());

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
