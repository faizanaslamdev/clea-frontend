'use client';

import {
  createContext,
  Suspense,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { ChatEntryBootstrap } from '@/lib/chat/chat-entry';
import { parseChatEntryBootstrap } from '@/lib/chat/chat-entry';
import { conversationIdFromPath } from '@/lib/chat/chat-footer-visibility';
import {
  EMPTY_CHAT_ENTRY_BOOTSTRAP,
  readEntryBootstrapFromLocation,
  resolveChatRouteParams,
} from '@/lib/chat/chat-route-params';
import { useChatSession } from '@/lib/hooks/useChatSession';

type ChatSessionValue = ReturnType<typeof useChatSession>;

const ChatSessionContext = createContext<ChatSessionValue | null>(null);

const ChatEntryBootstrapContext = createContext<
  Dispatch<SetStateAction<ChatEntryBootstrap>> | null
>(null);

function ChatSearchParamsBridge() {
  const searchParams = useSearchParams();
  const setEntryBootstrap = useContext(ChatEntryBootstrapContext);

  const bootstrap = useMemo(
    () => parseChatEntryBootstrap(searchParams),
    [searchParams],
  );

  useLayoutEffect(() => {
    setEntryBootstrap?.(bootstrap);
  }, [bootstrap, setEntryBootstrap]);

  return null;
}

function ChatSessionStateOwner({
  pathname,
  children,
}: {
  pathname: string;
  children: ReactNode;
}) {
  const [entryBootstrap, setEntryBootstrap] = useState(
    readEntryBootstrapFromLocation,
  );

  const routeParams = useMemo(
    () =>
      resolveChatRouteParams({
        pathname,
        entryBootstrap,
      }),
    [pathname, entryBootstrap],
  );

  const session = useChatSession({
    conversationId: routeParams.conversationId,
    urlQuery: routeParams.query,
    entryId: routeParams.entryId,
    legacyShopCategory: routeParams.legacyShopCategory,
  });

  return (
    <ChatEntryBootstrapContext.Provider value={setEntryBootstrap}>
      <ChatSessionContext.Provider value={session}>
        {children}
      </ChatSessionContext.Provider>
    </ChatEntryBootstrapContext.Provider>
  );
}

export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const conversationId = conversationIdFromPath(pathname);

  return (
    <ChatSessionStateOwner pathname={pathname}>
      {!conversationId ? (
        <Suspense fallback={null}>
          <ChatSearchParamsBridge />
        </Suspense>
      ) : null}
      {children}
    </ChatSessionStateOwner>
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
