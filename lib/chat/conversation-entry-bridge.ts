import type { ShopCategory } from '@/lib/api/chat-types';
import { threadContainsUserQuery } from '@/lib/chat/chat-thread-persistence';
import type { SearchChatMessageData } from '@/lib/chat/chat-messages';

const PENDING_ENTRY_KEY = 'clea-chat-pending-entry-v1';

export interface PendingLegacyEntry {
  version: 1;
  conversationId: string;
  query: string;
  shopCategory?: ShopCategory;
  clientTurnId: string;
}

function readPendingEntry(): PendingLegacyEntry | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(PENDING_ENTRY_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PendingLegacyEntry;
    if (
      parsed.version !== 1 ||
      typeof parsed.conversationId !== 'string' ||
      typeof parsed.query !== 'string' ||
      typeof parsed.clientTurnId !== 'string'
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function savePendingLegacyEntry(
  entry: Omit<PendingLegacyEntry, 'version'>,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: PendingLegacyEntry = { version: 1, ...entry };
  window.sessionStorage.setItem(PENDING_ENTRY_KEY, JSON.stringify(payload));
}

export function peekPendingLegacyEntry(
  conversationId: string,
): PendingLegacyEntry | null {
  const pending = readPendingEntry();
  if (!pending || pending.conversationId !== conversationId) {
    return null;
  }

  return pending;
}

export function consumePendingLegacyEntry(
  conversationId: string,
): PendingLegacyEntry | null {
  const pending = peekPendingLegacyEntry(conversationId);
  if (!pending) {
    return null;
  }

  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(PENDING_ENTRY_KEY);
  }

  return pending;
}

export function shouldSubmitPendingLegacyEntry(input: {
  conversationId: string;
  messages: SearchChatMessageData[];
}): PendingLegacyEntry | null {
  const pending = peekPendingLegacyEntry(input.conversationId);
  if (!pending) {
    return null;
  }

  if (threadContainsUserQuery(input.messages, pending.query)) {
    consumePendingLegacyEntry(input.conversationId);
    return null;
  }

  return pending;
}

export function clearPendingLegacyEntry(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(PENDING_ENTRY_KEY);
}
