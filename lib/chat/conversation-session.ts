import {
  createConversation as apiCreateConversation,
  fetchChatTurn,
  getConversation as apiGetConversation,
} from '@/lib/api/chat';
import type {
  ChatTurnContext,
  ChatTurnRequest,
  ChatTurnResult,
  CreateConversationResponse,
  RestoreConversationResponse,
  ShopCategory,
} from '@/lib/api/chat-types';
import { CHAT_DEFAULT_LOCALE } from '@/lib/constants/chat';
import {
  getAnonymousToken,
  saveAnonymousToken,
} from '@/lib/chat/conversation-token-store';

export interface ConversationSessionContext {
  conversationId: string;
  anonymousToken: string;
}

export async function createConversationSession(input?: {
  locale?: 'nb' | 'en';
  shopCategory?: ShopCategory;
}): Promise<CreateConversationResponse> {
  const created = await apiCreateConversation({
    locale: input?.locale ?? CHAT_DEFAULT_LOCALE,
    shopCategory: input?.shopCategory,
  });
  saveAnonymousToken(created.conversationId, created.anonymousToken);
  return created;
}

export async function restoreConversationSession(
  conversationId: string,
): Promise<RestoreConversationResponse> {
  const anonymousToken = getAnonymousToken(conversationId);
  if (!anonymousToken) {
    throw new Error('conversation_token_missing');
  }

  return apiGetConversation(conversationId, anonymousToken);
}

export async function sendConversationTurn(input: {
  conversationId: string;
  anonymousToken: string;
  message: string;
  clientTurnId: string;
  context?: ChatTurnContext;
  locale?: 'nb' | 'en';
  sessionId?: string;
}): Promise<ChatTurnResult> {
  const request: ChatTurnRequest = {
    message: input.message,
    context: input.context,
    conversationId: input.conversationId,
    anonymousToken: input.anonymousToken,
    clientTurnId: input.clientTurnId,
    locale: input.locale ?? CHAT_DEFAULT_LOCALE,
    sessionId: input.sessionId,
  };

  return fetchChatTurn(request);
}

export function bindConversationSession(
  conversationId: string,
  anonymousToken: string,
): ConversationSessionContext {
  saveAnonymousToken(conversationId, anonymousToken);
  return { conversationId, anonymousToken };
}

export function resolveConversationSession(
  conversationId: string,
): ConversationSessionContext | null {
  const anonymousToken = getAnonymousToken(conversationId);
  if (!anonymousToken) {
    return null;
  }

  return { conversationId, anonymousToken };
}
