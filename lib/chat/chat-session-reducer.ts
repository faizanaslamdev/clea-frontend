import type { CatalogQuery, ChatTurnResult } from '@/lib/api/chat-types';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import {
  buildAssistantMessageFromTurn,
  buildOptimisticTurnMessages,
  createAssistantErrorMessage,
  isPendingAssistantMessage,
  type SearchChatMessageData,
} from '@/lib/chat/chat-messages';
import type {
  ActiveTurn,
  ChatSessionState,
  TurnIdentity,
} from '@/lib/chat/chat-session-types';
import { initialChatSessionState } from '@/lib/chat/chat-session-types';

export type ChatSessionAction =
  | {
      type: 'TURN_BEGIN';
      identity: TurnIdentity;
      query: string;
      anchorPreview?: AnchorPreview;
      showAsProductReference?: boolean;
    }
  | {
      type: 'TURN_SUCCESS';
      turnId: string;
      query: string;
      result: ChatTurnResult;
    }
  | { type: 'TURN_ERROR'; turnId: string; errorMessage: string }
  | { type: 'SET_ACTIVE_PRODUCT'; productId: string | null }
  | { type: 'CLEAR_SUGGESTIONS'; messageId: string }
  | { type: 'LOAD_MORE_BEGIN'; messageId: string }
  | {
      type: 'LOAD_MORE_SUCCESS';
      messageId: string;
      result: ChatTurnResult;
      catalogQuery: CatalogQuery;
    }
  | { type: 'LOAD_MORE_ERROR'; errorMessage: string }
  | { type: 'RESET' };

function findActivePendingTurn(state: ChatSessionState): ActiveTurn | null {
  if (!state.activeTurn) {
    return null;
  }

  const assistant = state.messages.find(
    (message) => message.id === state.activeTurn?.assistantMessageId,
  );

  if (!assistant || !isPendingAssistantMessage(assistant)) {
    return null;
  }

  return state.activeTurn;
}

function replacePendingAssistantForTurn(
  messages: SearchChatMessageData[],
  turnId: string,
  assistantMessage: SearchChatMessageData,
): SearchChatMessageData[] {
  return messages.map((message) => {
    if (
      message.turnId !== turnId ||
      message.role !== 'assistant' ||
      !isPendingAssistantMessage(message)
    ) {
      return message;
    }

    return {
      ...assistantMessage,
      id: message.id,
      turnId: message.turnId,
    };
  });
}

export function chatSessionReducer(
  state: ChatSessionState,
  action: ChatSessionAction,
): ChatSessionState {
  switch (action.type) {
    case 'TURN_BEGIN': {
      const query = action.query.trim();
      if (!query) {
        return state;
      }

      const inFlight = findActivePendingTurn(state);
      if (inFlight?.query === query) {
        return state;
      }

      const [userMessage, assistantMessage] = buildOptimisticTurnMessages(
        query,
        action.identity,
        {
          anchorPreview: action.anchorPreview,
          showAsProductReference: action.showAsProductReference,
        },
      );

      return {
        ...state,
        messages: [...state.messages, userMessage, assistantMessage],
        activeTurn: {
          id: action.identity.turnId,
          query,
          assistantMessageId: action.identity.assistantMessageId,
        },
      };
    }

    case 'TURN_SUCCESS': {
      const messages = replacePendingAssistantForTurn(
        state.messages,
        action.turnId,
        buildAssistantMessageFromTurn(action.query, action.result),
      );

      return {
        ...state,
        messages,
        activeTurn:
          state.activeTurn?.id === action.turnId ? null : state.activeTurn,
        activeProductId:
          action.result.anchorProductId ?? state.activeProductId,
      };
    }

    case 'TURN_ERROR': {
      const messages = replacePendingAssistantForTurn(
        state.messages,
        action.turnId,
        createAssistantErrorMessage(action.errorMessage),
      );

      return {
        ...state,
        messages,
        activeTurn:
          state.activeTurn?.id === action.turnId ? null : state.activeTurn,
      };
    }

    case 'SET_ACTIVE_PRODUCT':
      return { ...state, activeProductId: action.productId };

    case 'CLEAR_SUGGESTIONS':
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === action.messageId
            ? { ...message, suggestions: undefined }
            : message,
        ),
      };

    case 'LOAD_MORE_BEGIN':
      return { ...state, loadingMoreMessageId: action.messageId };

    case 'LOAD_MORE_SUCCESS':
      return {
        ...state,
        loadingMoreMessageId: null,
        messages: state.messages.map((message) =>
          message.id === action.messageId
            ? {
                ...message,
                products: [
                  ...(message.products ?? []),
                  ...action.result.products,
                ],
                searchTotal: action.result.total,
                searchHasMore: action.result.hasMore,
                searchLimit: action.result.limit,
                catalogQuery:
                  action.result.catalogQuery ?? action.catalogQuery,
              }
            : message,
        ),
      };

    case 'LOAD_MORE_ERROR':
      return {
        ...state,
        loadingMoreMessageId: null,
        messages: [
          ...state.messages,
          createAssistantErrorMessage(action.errorMessage),
        ],
      };

    case 'RESET':
      return { ...initialChatSessionState };

    default:
      return state;
  }
}
