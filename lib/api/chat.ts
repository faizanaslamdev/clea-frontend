import { apiFetch } from '@/lib/api/backend-client';
import { mapChatProductCardToProduct } from '@/lib/api/chat-mappers';
import type {
  ChatSuggestionsResponse,
  ChatTurnRequest,
  ChatTurnResponse,
  ChatTurnResult,
} from '@/lib/api/chat-types';

export type {
  CatalogQuery,
  ChatIntent,
  ChatTurnRequest,
  ChatTurnResult,
} from '@/lib/api/chat-types';

const CHAT_SESSION_KEY = 'clea-chat-session';

export function getOrCreateChatSessionId(): string {
  if (typeof window === 'undefined') {
    return 'sess_server';
  }

  const existing = sessionStorage.getItem(CHAT_SESSION_KEY);
  if (existing) {
    return existing;
  }

  const id = `sess_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  sessionStorage.setItem(CHAT_SESSION_KEY, id);
  return id;
}

export function resetChatSessionId(): string {
  if (typeof window === 'undefined') {
    return 'sess_server';
  }

  sessionStorage.removeItem(CHAT_SESSION_KEY);
  return getOrCreateChatSessionId();
}

export async function fetchChatSuggestions(params: {
  shopCategory?: ChatSuggestionsResponse['shopCategory'];
  locale?: ChatSuggestionsResponse['locale'];
}): Promise<ChatSuggestionsResponse> {
  const search = new URLSearchParams();
  if (params.shopCategory) {
    search.set('shopCategory', params.shopCategory);
  }
  if (params.locale) {
    search.set('locale', params.locale);
  }

  const query = search.toString();
  return apiFetch<ChatSuggestionsResponse>(
    `/chat/suggestions${query ? `?${query}` : ''}`,
    { cache: 'no-store' },
  );
}

export async function fetchChatTurn(
  request: ChatTurnRequest,
): Promise<ChatTurnResult> {
  const data = await apiFetch<ChatTurnResponse>('/chat/turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    cache: 'no-store',
  });

  return {
    reply: data.reply,
    intent: data.intent,
    products: data.products.map(mapChatProductCardToProduct),
    total: data.total,
    limit: data.limit,
    offset: data.offset,
    hasMore: data.hasMore,
    catalogQuery: data.catalogQuery,
    anchorProductId: data.anchorProductId,
    suggestions: data.suggestions,
    usedFallback: data.meta?.usedFallback ?? false,
    degraded: data.meta?.degraded ?? false,
  };
}
