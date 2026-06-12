'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { ChatAnchorKind } from '@/lib/chat/anchor-actions';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import {
  getChatAnchorBridge,
  setChatAnchorBridge,
  subscribeChatAnchorBridge,
} from '@/lib/chat/chat-anchor-bridge';

export interface ChatAnchorContextValue {
  activeProductId: string | null;
  setActiveProductId: (productId: string | null) => void;
  runAnchorAction: (
    productId: string,
    kind: ChatAnchorKind,
    preview?: AnchorPreview,
  ) => Promise<void>;
  sendProductMessage: (
    query: string,
    productId: string,
    preview?: AnchorPreview,
  ) => Promise<void>;
  isAnchorLoading: boolean;
}

const ChatAnchorContext = createContext<ChatAnchorContextValue | null>(null);

interface ChatAnchorProviderProps {
  children: ReactNode;
  runAnchorAction: (
    productId: string,
    kind: ChatAnchorKind,
    preview?: AnchorPreview,
  ) => Promise<void>;
  sendProductMessage: (
    query: string,
    productId: string,
    preview?: AnchorPreview,
  ) => Promise<void>;
  isAnchorLoading?: boolean;
  activeProductId?: string | null;
  onActiveProductIdChange?: (productId: string | null) => void;
}

export function ChatAnchorProvider({
  children,
  runAnchorAction,
  sendProductMessage,
  isAnchorLoading = false,
  activeProductId: controlledActiveProductId,
  onActiveProductIdChange,
}: ChatAnchorProviderProps) {
  const [uncontrolledActiveProductId, setUncontrolledActiveProductId] = useState<
    string | null
  >(null);

  const activeProductId =
    controlledActiveProductId ?? uncontrolledActiveProductId;
  const setActiveProductId =
    onActiveProductIdChange ?? setUncontrolledActiveProductId;

  const value = useMemo(
    () => ({
      activeProductId,
      setActiveProductId,
      runAnchorAction,
      sendProductMessage,
      isAnchorLoading,
    }),
    [
      activeProductId,
      isAnchorLoading,
      runAnchorAction,
      sendProductMessage,
      setActiveProductId,
    ],
  );

  useEffect(() => {
    setChatAnchorBridge(value);
    return () => setChatAnchorBridge(null);
  }, [value]);

  return (
    <ChatAnchorContext.Provider value={value}>
      {children}
    </ChatAnchorContext.Provider>
  );
}

export function useChatAnchor(): ChatAnchorContextValue {
  const context = useContext(ChatAnchorContext);
  if (!context) {
    throw new Error('useChatAnchor must be used within ChatAnchorProvider');
  }
  return context;
}

export function useChatAnchorOptional(): ChatAnchorContextValue | null {
  return useContext(ChatAnchorContext);
}

/** Chat page context when mounted; otherwise the global bridge (e.g. product modal). */
export function useChatAnchorConnection(): ChatAnchorContextValue | null {
  const context = useChatAnchorOptional();
  const bridge = useSyncExternalStore(
    subscribeChatAnchorBridge,
    getChatAnchorBridge,
    () => null,
  );
  return context ?? bridge;
}
