'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ChatAnchorKind } from '@/lib/chat/anchor-actions';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import { setChatAnchorBridge } from '@/lib/chat/chat-anchor-bridge';

export interface ChatAnchorContextValue {
  activeProductId: string | null;
  setActiveProductId: (productId: string | null) => void;
  runAnchorAction: (
    productId: string,
    kind: ChatAnchorKind,
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
  isAnchorLoading?: boolean;
  activeProductId?: string | null;
  onActiveProductIdChange?: (productId: string | null) => void;
}

export function ChatAnchorProvider({
  children,
  runAnchorAction,
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
      isAnchorLoading,
    }),
    [activeProductId, isAnchorLoading, runAnchorAction, setActiveProductId],
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
