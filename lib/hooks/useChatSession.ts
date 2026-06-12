'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchChatTurn,
  getOrCreateChatSessionId,
  resetChatSessionId,
} from '@/lib/api/chat';
import { resolveChatErrorMessage } from '@/lib/api/api-errors';
import {
  anchorMessageForKind,
  clearAnchorTurnContext,
  reconcileAnchorSessionForMessage,
  type ChatAnchorKind,
} from '@/lib/chat/anchor-actions';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import { performChatReset } from '@/lib/chat/chat-reset';
import { chatSessionReducer } from '@/lib/chat/chat-session-reducer';
import {
  createTurnIdentity,
  initialChatSessionState,
  type SendMessageInput,
} from '@/lib/chat/chat-session-types';
import { resolveHydratedSendSource } from '@/lib/chat/start-product-chat';
import { resolveSendMessage } from '@/lib/chat/resolve-send-message';
import { syncAnchorSessionForTurn } from '@/lib/chat/anchor-turn-state';
import { CHAT_DEFAULT_LOCALE } from '@/lib/constants/chat';
import type { ShopCategory } from '@/lib/api/chat-types';

export interface UseChatSessionOptions {
  /** Initial `?q=` from the URL — triggers the first turn once. */
  urlQuery?: string;
  /** Initial `?category=` from the homepage gender tab. */
  urlShopCategory?: ShopCategory;
}

export function useChatSession({
  urlQuery = '',
  urlShopCategory,
}: UseChatSessionOptions = {}) {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    chatSessionReducer,
    initialChatSessionState,
  );
  const [draft, setDraft] = useState('');

  const stateRef = useRef(state);
  stateRef.current = state;

  const sessionIdRef = useRef<string | null>(null);
  const requestGenerationRef = useRef(0);
  const hydratedUrlQueryRef = useRef<string | null>(null);
  const shopCategoryRef = useRef<ShopCategory | undefined>(urlShopCategory);

  useEffect(() => {
    if (urlShopCategory) {
      shopCategoryRef.current = urlShopCategory;
    }
  }, [urlShopCategory]);

  const getSessionId = useCallback(() => {
    sessionIdRef.current ??= getOrCreateChatSessionId();
    return sessionIdRef.current;
  }, []);

  const requestTurn = useCallback(
    async (message: string, context?: SendMessageInput['context']) => {
      const shopCategory = shopCategoryRef.current;

      return fetchChatTurn({
        message,
        context: shopCategory ? { ...context, shopCategory } : context,
        sessionId: getSessionId(),
        locale: CHAT_DEFAULT_LOCALE,
      });
    },
    [getSessionId],
  );

  const sendMessage = useCallback(
    async (input: SendMessageInput) => {
      const trimmed = input.query.trim();
      if (!trimmed) {
        return;
      }

      const current = stateRef.current;
      const inFlight = current.activeTurn;

      if (inFlight && inFlight.query !== trimmed) {
        return;
      }

      const resolved = resolveSendMessage({
        query: trimmed,
        source: input.source ?? 'composer',
        explicitContext: input.context,
        activeProductId: current.activeProductId,
        anchorPreview: input.anchorPreview,
        suggestionSourceAnchorProductId: input.suggestionSourceAnchorProductId,
      });

      if (resolved.clearActiveProduct) {
        dispatch({ type: 'SET_ACTIVE_PRODUCT', productId: null });
        clearAnchorTurnContext();
      } else if (resolved.context?.productId) {
        dispatch({
          type: 'SET_ACTIVE_PRODUCT',
          productId: resolved.context.productId,
        });
      }

      const generation = requestGenerationRef.current + 1;
      requestGenerationRef.current = generation;

      let turnId: string;

      if (inFlight?.query === trimmed) {
        turnId = inFlight.id;
      } else {
        const identity = createTurnIdentity();
        turnId = identity.turnId;
        dispatch({
          type: 'TURN_BEGIN',
          identity,
          query: trimmed,
          anchorPreview: resolved.anchorPreview,
          showAsProductReference: resolved.showAsProductReference,
        });
        setDraft('');
      }

      syncAnchorSessionForTurn(resolved.context, trimmed, {
        persistAnchor: input.persistAnchor,
        anchorPreview: resolved.anchorPreview,
      });

      try {
        const result = await requestTurn(trimmed, resolved.context);
        if (requestGenerationRef.current !== generation) {
          return;
        }

        dispatch({
          type: 'TURN_SUCCESS',
          turnId,
          query: trimmed,
          result,
        });
      } catch (error) {
        if (requestGenerationRef.current !== generation) {
          return;
        }

        dispatch({
          type: 'TURN_ERROR',
          turnId,
          errorMessage: resolveChatErrorMessage(error),
        });
      }
    },
    [requestTurn],
  );

  const selectSuggestion = useCallback(
    (query: string, sourceMessageId: string) => {
      if (stateRef.current.activeTurn) {
        return;
      }

      const sourceMessage = stateRef.current.messages.find(
        (message) => message.id === sourceMessageId,
      );

      dispatch({ type: 'CLEAR_SUGGESTIONS', messageId: sourceMessageId });

      void sendMessage({
        query,
        source: 'suggestion',
        suggestionSourceAnchorProductId: sourceMessage?.anchorProductId,
      });
    },
    [sendMessage],
  );

  const runAnchorAction = useCallback(
    async (
      productId: string,
      kind: ChatAnchorKind,
      preview?: AnchorPreview,
    ) => {
      await sendMessage({
        query: anchorMessageForKind(kind),
        source: 'anchor-action',
        context: { productId },
        anchorPreview: preview,
      });
    },
    [sendMessage],
  );

  const loadMore = useCallback(
    async (messageId: string) => {
      const target = stateRef.current.messages.find(
        (message) => message.id === messageId,
      );

      if (
        !target?.catalogQuery ||
        !target.searchHasMore ||
        target.intent === 'similar_products' ||
        target.intent === 'cheaper_alternatives'
      ) {
        return;
      }

      const nextOffset =
        (target.catalogQuery.offset ?? 0) + (target.searchLimit ?? 12);

      const catalogQuery = {
        ...target.catalogQuery,
        offset: nextOffset,
      };

      dispatch({ type: 'LOAD_MORE_BEGIN', messageId });

      try {
        const result = await requestTurn('', {
          intent: target.intent ?? 'product_search',
          catalog: catalogQuery,
        });

        dispatch({
          type: 'LOAD_MORE_SUCCESS',
          messageId,
          result,
          catalogQuery,
        });
      } catch (error) {
        dispatch({
          type: 'LOAD_MORE_ERROR',
          errorMessage: resolveChatErrorMessage(error),
        });
      }
    },
    [requestTurn],
  );

  const reset = useCallback(() => {
    requestGenerationRef.current += 1;
    hydratedUrlQueryRef.current = null;
    shopCategoryRef.current = undefined;
    dispatch({ type: 'RESET' });
    setDraft('');

    const { sessionId } = performChatReset({
      resetSessionId: () => {
        const nextSessionId = resetChatSessionId();
        sessionIdRef.current = nextSessionId;
        return nextSessionId;
      },
    });

    sessionIdRef.current = sessionId;
    router.replace('/chat', { scroll: false });
  }, [router]);

  const setActiveProductId = useCallback((productId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_PRODUCT', productId });
    if (!productId) {
      clearAnchorTurnContext();
    }
  }, []);

  useEffect(() => {
    const trimmed = urlQuery.trim();

    if (!trimmed) {
      hydratedUrlQueryRef.current = null;
      return;
    }

    if (hydratedUrlQueryRef.current === trimmed) {
      return;
    }

    hydratedUrlQueryRef.current = trimmed;

    const anchorPreview = reconcileAnchorSessionForMessage(trimmed);
    const source = resolveHydratedSendSource(trimmed, anchorPreview);

    void sendMessage({
      query: trimmed,
      source,
      context: anchorPreview
        ? { productId: anchorPreview.productId }
        : undefined,
      anchorPreview,
    });
  }, [sendMessage, urlQuery]);

  const isBusy = state.activeTurn !== null;
  const showLanding = !urlQuery.trim() && state.messages.length === 0;
  return {
    messages: state.messages,
    draft,
    setDraft,
    isBusy,
    showLanding,
    activeProductId: state.activeProductId,
    setActiveProductId,
    loadingMoreMessageId: state.loadingMoreMessageId,
    sendMessage,
    selectSuggestion,
    runAnchorAction,
    loadMore,
    reset,
  };
}
