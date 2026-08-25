import type { ShopCategory } from '@/lib/api/chat-types';
import type { SearchChatMessageData } from '@/lib/chat/chat-messages';
import type { ChatSessionState } from '@/lib/chat/chat-session-types';
import { clearBootstrapEntryState } from '@/lib/chat/chat-bootstrap-entry';

export const CHAT_THREAD_STORAGE_KEY = 'clea-chat-thread-v1';
export const CHAT_SHOP_CATEGORY_STORAGE_KEY = 'clea-chat-shop-category-v1';

export interface PersistedChatThread {
  version: 1;
  messages: SearchChatMessageData[];
  activeProductId: string | null;
  shopCategory?: ShopCategory;
}

export function threadContainsUserQuery(
  messages: SearchChatMessageData[],
  query: string,
): boolean {
  const normalized = query.trim().toLowerCase();
  return messages.some(
    (message) =>
      message.role === 'user' &&
      message.content.trim().toLowerCase() === normalized,
  );
}

function readStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota or private-mode failures — chat remains in-memory only.
  }
}

export function restorePersistedChatThread(): ChatSessionState | null {
  const persisted = readStorage<PersistedChatThread>(CHAT_THREAD_STORAGE_KEY);
  if (!persisted || persisted.version !== 1) {
    return null;
  }

  if (!Array.isArray(persisted.messages)) {
    return null;
  }

  let messages = persisted.messages;
  const last = messages[messages.length - 1];
  if (last?.role === 'assistant' && last.status === 'pending') {
    messages = messages.slice(0, -1);
    const trailingUser = messages[messages.length - 1];
    if (trailingUser?.role === 'user') {
      messages = messages.slice(0, -1);
    }
  }

  return {
    messages,
    activeProductId: persisted.activeProductId ?? null,
    activeTurn: null,
    loadingMoreMessageId: null,
  };
}

export function persistChatThread(
  state: ChatSessionState,
  shopCategory?: ShopCategory,
): void {
  const payload: PersistedChatThread = {
    version: 1,
    messages: state.messages,
    activeProductId: state.activeProductId,
    shopCategory,
  };
  writeStorage(CHAT_THREAD_STORAGE_KEY, payload);
}

export function clearChatThreadPersistence(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(CHAT_THREAD_STORAGE_KEY);
  // Legacy shop-category persistence — cleared so stale mens/womens cannot leak.
  window.sessionStorage.removeItem(CHAT_SHOP_CATEGORY_STORAGE_KEY);
  clearBootstrapEntryState();
}
