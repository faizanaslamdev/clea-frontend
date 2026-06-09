import type { ChatAnchorContextValue } from '@/components/chat/chat-anchor-provider';

let bridgeValue: ChatAnchorContextValue | null = null;
const listeners = new Set<() => void>();

export function setChatAnchorBridge(value: ChatAnchorContextValue | null): void {
  bridgeValue = value;
  listeners.forEach((listener) => listener());
}

export function getChatAnchorBridge(): ChatAnchorContextValue | null {
  return bridgeValue;
}

export function subscribeChatAnchorBridge(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
