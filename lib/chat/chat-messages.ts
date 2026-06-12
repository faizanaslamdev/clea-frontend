import type { ChatTurnResult } from '@/lib/api/chat-types';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import { isAnchorActionMessage } from '@/lib/chat/anchor-preview';

export type ChatMessageStatus = 'pending' | 'complete';

export interface SearchChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** Links user and assistant messages from the same send action. */
  turnId?: string;
  status?: ChatMessageStatus;
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
): Omit<SearchChatMessageData, 'id' | 'role' | 'content' | 'status'> {
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

export function isPendingAssistantMessage(
  message: SearchChatMessageData,
): boolean {
  return message.role === 'assistant' && message.status === 'pending';
}

export interface UserMessageBuildOptions {
  anchorPreview?: AnchorPreview;
  showAsProductReference?: boolean;
}

export function userMessageOptionsForTurn(
  query: string,
  options?: UserMessageBuildOptions,
): Omit<SearchChatMessageData, 'id' | 'role' | 'content'> | undefined {
  const anchorPreview = options?.anchorPreview;
  if (!anchorPreview) {
    return undefined;
  }

  const showReference =
    options?.showAsProductReference === true ||
    isAnchorActionMessage(query);

  if (!showReference) {
    return undefined;
  }

  return {
    anchorProductId: anchorPreview.productId,
    anchorPreview,
  };
}

export function isProductReferenceUserMessage(
  message: SearchChatMessageData,
): boolean {
  return message.role === 'user' && Boolean(message.anchorPreview);
}

export function buildUserMessage(
  query: string,
  options?: UserMessageBuildOptions,
): SearchChatMessageData {
  const trimmed = query.trim();
  const userOptions = userMessageOptionsForTurn(trimmed, options);
  return createMessage('user', trimmed, userOptions);
}

export function buildPendingAssistantMessage(): SearchChatMessageData {
  return createMessage('assistant', '', { status: 'pending' });
}

export function buildOptimisticTurnPair(
  query: string,
  options?: UserMessageBuildOptions,
): [SearchChatMessageData, SearchChatMessageData] {
  return [buildUserMessage(query, options), buildPendingAssistantMessage()];
}

export function buildOptimisticTurnMessages(
  query: string,
  identity: {
    turnId: string;
    userMessageId: string;
    assistantMessageId: string;
  },
  options?: UserMessageBuildOptions,
): [SearchChatMessageData, SearchChatMessageData] {
  const [userMessage, assistantMessage] = buildOptimisticTurnPair(
    query,
    options,
  );

  return [
    { ...userMessage, id: identity.userMessageId, turnId: identity.turnId },
    {
      ...assistantMessage,
      id: identity.assistantMessageId,
      turnId: identity.turnId,
    },
  ];
}

export function buildAssistantMessageFromTurn(
  query: string,
  turn: ChatTurnResult,
): SearchChatMessageData {
  return createMessage('assistant', turn.reply, {
    ...assistantOptionsFromTurn(query, turn),
    status: 'complete',
  });
}

export function createAssistantErrorMessage(
  errorReply: string,
): SearchChatMessageData {
  return createMessage('assistant', errorReply, { status: 'complete' });
}

/** Completed user + assistant pair (e.g. URL hydration without optimistic flow). */
export function buildTurnMessagePair(
  query: string,
  turn: ChatTurnResult,
  options?: UserMessageBuildOptions,
): SearchChatMessageData[] {
  return [
    buildUserMessage(query, options),
    buildAssistantMessageFromTurn(query, turn),
  ];
}

export function buildErrorTurnMessagePair(
  query: string,
  errorReply: string,
  options?: UserMessageBuildOptions,
): SearchChatMessageData[] {
  return [
    buildUserMessage(query, options),
    createAssistantErrorMessage(errorReply),
  ];
}
