'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchChatTurn,
  getOrCreateChatSessionId,
  resetChatSessionId,
} from '@/lib/api/chat';
import { resolveChatErrorMessage } from '@/lib/api/api-errors';
import type { ChatTurnContext, ShopCategory } from '@/lib/api/chat-types';
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
import {
  persistShopCategory,
  restorePersistedShopCategory,
} from '@/lib/chat/chat-thread-persistence';
import {
  createConversationSession,
  resolveConversationSession,
  restoreConversationSession,
  sendConversationTurn,
} from '@/lib/chat/conversation-session';
import {
  consumePendingLegacyEntry,
  savePendingLegacyEntry,
  shouldSubmitPendingLegacyEntry,
} from '@/lib/chat/conversation-entry-bridge';
import { mapRestoreConversationToMessages } from '@/lib/chat/restore-conversation-messages';
import { resolveHydratedSendSource } from '@/lib/chat/start-product-chat';
import { resolveSendMessage } from '@/lib/chat/resolve-send-message';
import { syncAnchorSessionForTurn } from '@/lib/chat/anchor-turn-state';
import { CHAT_DEFAULT_LOCALE } from '@/lib/constants/chat';

export interface UseChatSessionOptions {
  conversationId?: string;
  /** Legacy entry-only `?q=` from /chat — not used on /chat/{id}. */
  urlQuery?: string;
  urlShopCategory?: ShopCategory;
}

type RestoreStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useChatSession({
  conversationId,
  urlQuery = '',
  urlShopCategory,
}: UseChatSessionOptions = {}) {
  const router = useRouter();
  const [state, dispatch] = useReducer(chatSessionReducer, initialChatSessionState);
  const [draft, setDraft] = useState('');
  const [restoreStatus, setRestoreStatus] = useState<RestoreStatus>(
    conversationId ? 'loading' : 'idle',
  );
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;

  const sessionIdRef = useRef<string | null>(null);
  const requestGenerationRef = useRef(0);
  const legacyEntryStartedRef = useRef(false);
  const conversationSessionRef = useRef<{
    conversationId: string;
    anonymousToken: string;
  } | null>(
    conversationId ? resolveConversationSession(conversationId) : null,
  );
  const shopCategoryRef = useRef<ShopCategory | undefined>(
    urlShopCategory ?? restorePersistedShopCategory(),
  );

  const usesServerConversation = Boolean(conversationId ?? conversationSessionRef.current);

  useEffect(() => {
    if (urlShopCategory) {
      shopCategoryRef.current = urlShopCategory;
      persistShopCategory(urlShopCategory);
    }
  }, [urlShopCategory]);

  const getSessionId = useCallback(() => {
    sessionIdRef.current ??= getOrCreateChatSessionId();
    return sessionIdRef.current;
  }, []);

  const navigateToConversation = useCallback(
    (nextConversationId: string) => {
      router.replace(`/chat/${nextConversationId}`, { scroll: false });
    },
    [router],
  );

  const ensureConversationSession = useCallback(async () => {
    if (conversationId) {
      const existing = resolveConversationSession(conversationId);
      if (!existing) {
        throw new Error('conversation_token_missing');
      }
      conversationSessionRef.current = existing;
      return existing;
    }

    if (conversationSessionRef.current) {
      return conversationSessionRef.current;
    }

    const created = await createConversationSession({
      locale: CHAT_DEFAULT_LOCALE,
      shopCategory: shopCategoryRef.current,
    });
    conversationSessionRef.current = {
      conversationId: created.conversationId,
      anonymousToken: created.anonymousToken,
    };
    navigateToConversation(created.conversationId);
    return conversationSessionRef.current;
  }, [conversationId, navigateToConversation]);

  const requestTurn = useCallback(
    async (
      message: string,
      context?: ChatTurnContext,
      clientTurnId?: string,
    ) => {
      const shopCategory = shopCategoryRef.current;
      const mergedContext = shopCategory ? { ...context, shopCategory } : context;

      if (usesServerConversation || conversationSessionRef.current) {
        const session =
          conversationSessionRef.current ??
          (conversationId
            ? resolveConversationSession(conversationId)
            : null);

        if (!session) {
          const ensured = await ensureConversationSession();
          return sendConversationTurn({
            message,
            context: mergedContext,
            conversationId: ensured.conversationId,
            anonymousToken: ensured.anonymousToken,
            clientTurnId: clientTurnId ?? crypto.randomUUID(),
            sessionId: getSessionId(),
            locale: CHAT_DEFAULT_LOCALE,
          });
        }

        return sendConversationTurn({
          message,
          context: mergedContext,
          conversationId: session.conversationId,
          anonymousToken: session.anonymousToken,
          clientTurnId: clientTurnId ?? crypto.randomUUID(),
          sessionId: getSessionId(),
          locale: CHAT_DEFAULT_LOCALE,
        });
      }

      return fetchChatTurn({
        message,
        context: mergedContext,
        sessionId: getSessionId(),
        locale: CHAT_DEFAULT_LOCALE,
      });
    },
    [
      conversationId,
      ensureConversationSession,
      getSessionId,
      usesServerConversation,
    ],
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

      if (!conversationId && !conversationSessionRef.current) {
        try {
          await ensureConversationSession();
        } catch (error) {
          dispatch({
            type: 'TURN_ERROR',
            turnId: inFlight?.id ?? crypto.randomUUID(),
            errorMessage: resolveChatErrorMessage(error),
          });
          return;
        }
      }

      const generation = requestGenerationRef.current + 1;
      requestGenerationRef.current = generation;

      let turnId: string;
      let clientTurnId: string;

      if (inFlight?.query === trimmed) {
        turnId = inFlight.id;
        clientTurnId = inFlight.clientTurnId;
      } else {
        const identity = createTurnIdentity();
        turnId = identity.turnId;
        clientTurnId = input.clientTurnId ?? identity.turnId;
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
        const result = await requestTurn(
          trimmed,
          resolved.context,
          clientTurnId,
        );
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
    [conversationId, ensureConversationSession, requestTurn],
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
        target.intent === 'cheaper_alternatives' ||
        stateRef.current.loadingMoreMessageId
      ) {
        return;
      }

      const nextOffset = target.products?.length ?? 0;
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
    legacyEntryStartedRef.current = false;
    conversationSessionRef.current = null;
    shopCategoryRef.current = undefined;
    dispatch({ type: 'RESET' });
    setDraft('');
    setRestoreStatus('idle');
    setRestoreError(null);

    const { sessionId } = performChatReset({
      resetSessionId: () => {
        const nextSessionId = resetChatSessionId();
        sessionIdRef.current = nextSessionId;
        return nextSessionId;
      },
    });

    sessionIdRef.current = sessionId;

    void (async () => {
      try {
        const created = await createConversationSession({
          locale: CHAT_DEFAULT_LOCALE,
        });
        conversationSessionRef.current = {
          conversationId: created.conversationId,
          anonymousToken: created.anonymousToken,
        };
        navigateToConversation(created.conversationId);
      } catch {
        router.replace('/chat', { scroll: false });
      }
    })();
  }, [navigateToConversation, router]);

  const setActiveProductId = useCallback((productId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_PRODUCT', productId });
    if (!productId) {
      clearAnchorTurnContext();
    }
  }, []);

  useEffect(() => {
    if (!conversationId) {
      setRestoreStatus('idle');
      return;
    }

    let cancelled = false;
    setRestoreStatus('loading');
    setRestoreError(null);

    void (async () => {
      try {
        const restored = await restoreConversationSession(conversationId);
        if (cancelled) {
          return;
        }

        if (restored.shopCategory) {
          shopCategoryRef.current = restored.shopCategory;
          persistShopCategory(restored.shopCategory);
        }

        dispatch({
          type: 'RESTORE_SUCCESS',
          messages: mapRestoreConversationToMessages(restored),
        });
        setRestoreStatus('ready');
      } catch (error) {
        if (cancelled) {
          return;
        }
        setRestoreStatus('error');
        setRestoreError(resolveChatErrorMessage(error));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    const trimmed = urlQuery.trim();
    if (conversationId || !trimmed || legacyEntryStartedRef.current) {
      return;
    }

    legacyEntryStartedRef.current = true;

    void (async () => {
      try {
        const created = await createConversationSession({
          locale: CHAT_DEFAULT_LOCALE,
          shopCategory: urlShopCategory ?? shopCategoryRef.current,
        });
        conversationSessionRef.current = {
          conversationId: created.conversationId,
          anonymousToken: created.anonymousToken,
        };

        const clientTurnId = crypto.randomUUID();
        savePendingLegacyEntry({
          conversationId: created.conversationId,
          query: trimmed,
          shopCategory: urlShopCategory,
          clientTurnId,
        });

        navigateToConversation(created.conversationId);
      } catch (error) {
        setRestoreError(resolveChatErrorMessage(error));
      }
    })();
  }, [conversationId, navigateToConversation, urlQuery, urlShopCategory]);

  useEffect(() => {
    if (!conversationId || restoreStatus !== 'ready') {
      return;
    }

    const pending = shouldSubmitPendingLegacyEntry({
      conversationId,
      messages: stateRef.current.messages,
    });
    if (!pending) {
      return;
    }

    consumePendingLegacyEntry(conversationId);

    void (async () => {
      const anchorPreview = reconcileAnchorSessionForMessage(pending.query);
      const source = resolveHydratedSendSource(pending.query, anchorPreview);
      await sendMessage({
        query: pending.query,
        source,
        context: anchorPreview
          ? { productId: anchorPreview.productId }
          : pending.shopCategory
            ? { shopCategory: pending.shopCategory }
            : undefined,
        anchorPreview,
        clientTurnId: pending.clientTurnId,
      });
    })();
  }, [conversationId, restoreStatus, sendMessage]);

  const isBusy = state.activeTurn !== null;
  const isRestoring = restoreStatus === 'loading';
  const showLanding =
    !conversationId &&
    state.messages.length === 0 &&
    !urlQuery.trim() &&
    !isRestoring;

  return {
    messages: state.messages,
    draft,
    setDraft,
    isBusy,
    isRestoring,
    restoreError,
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
