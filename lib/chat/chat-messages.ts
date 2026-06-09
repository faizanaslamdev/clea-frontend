import type { ChatTurnResult } from '@/lib/api/chat-types';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import { isAnchorActionMessage } from '@/lib/chat/anchor-preview';

export interface SearchChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: import('@/lib/types').Product[];
  query?: string;
  searchTotal?: number;
  searchHasMore?: boolean;
  searchLimit?: number;
  catalogQuery?: import('@/lib/api/chat-types').CatalogQuery;
  intent?: import('@/lib/api/chat-types').ChatIntent;
  anchorProductId?: string;
  anchorPreview?: AnchorPreview;
  suggestions?: string[];
  degraded?: boolean;
}

function createMessage(
  role: SearchChatMessageData['role'],
  content: string,
  options?: Omit<SearchChatMessageData, 'id' | 'role' | 'content'>,
): SearchChatMessageData {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    ...options,
  };
}

function assistantOptionsFromTurn(
  query: string,
  turn: ChatTurnResult,
): Omit<SearchChatMessageData, 'id' | 'role' | 'content'> {
  return {
    products: turn.products.length > 0 ? turn.products : undefined,
    query: query.trim() || undefined,
    searchTotal: turn.usedFallback ? turn.products.length : turn.total,
    searchHasMore: turn.hasMore,
    searchLimit: turn.limit,
    catalogQuery: turn.catalogQuery,
    intent: turn.intent,
    anchorProductId: turn.anchorProductId,
    suggestions: turn.suggestions,
    degraded: turn.degraded,
  };
}

export function userMessageOptionsForTurn(
  query: string,
  anchorPreview?: AnchorPreview,
): Omit<SearchChatMessageData, 'id' | 'role' | 'content'> | undefined {
  if (!anchorPreview || !isAnchorActionMessage(query)) {
    return undefined;
  }

  return {
    anchorProductId: anchorPreview.productId,
    anchorPreview,
  };
}

export function buildTurnMessagePair(
  query: string,
  turn: ChatTurnResult,
  options?: { anchorPreview?: AnchorPreview },
): SearchChatMessageData[] {
  const trimmed = query.trim();
  const userOptions = userMessageOptionsForTurn(trimmed, options?.anchorPreview);

  return [
    createMessage('user', trimmed, userOptions),
    createMessage('assistant', turn.reply, assistantOptionsFromTurn(query, turn)),
  ];
}

export function buildErrorTurnMessagePair(
  query: string,
  errorReply: string,
  options?: { anchorPreview?: AnchorPreview },
): SearchChatMessageData[] {
  const trimmed = query.trim();
  const userOptions = userMessageOptionsForTurn(trimmed, options?.anchorPreview);

  return [
    createMessage('user', trimmed, userOptions),
    createMessage('assistant', errorReply),
  ];
}
