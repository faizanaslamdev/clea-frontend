'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getOrCreateChatSessionId,
  resetChatSessionId,
} from '@/lib/api/chat';
import { resolveChatErrorMessage } from '@/lib/api/api-errors';
import type { ChatTurnContext, ShopCategory } from '@/lib/api/chat-types';
import {
  anchorMessageForKind,
  clearAnchorTurnContext,
  type ChatAnchorKind,
} from '@/lib/chat/anchor-actions';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import { shouldHideChatFooter, shouldSkipConversationRestore } from '@/lib/chat/chat-footer-visibility';
import { performChatReset } from '@/lib/chat/chat-reset';
import { chatSessionReducer } from '@/lib/chat/chat-session-reducer';
import {
  createTurnIdentity,
  initialChatSessionState,
  type SendMessageInput,
} from '@/lib/chat/chat-session-types';
import {
  anchorPreviewFromPendingEntry,
  completeBootstrapEntry,
  createLegacyBootstrapEntry,
  releaseBootstrapEntryClaim,
  shouldHydrateBootstrapEntry,
  tryClaimBootstrapEntry,
} from '@/lib/chat/chat-bootstrap-entry';
import { buildLegacyChatEntryUrl } from '@/lib/chat/chat-entry';
import {
  createConversationSession,
  resolveConversationSession,
  restoreConversationSession,
  sendConversationTurn,
} from '@/lib/chat/conversation-session';
import { mapRestoreConversationToMessages } from '@/lib/chat/restore-conversation-messages';
import { isPendingAssistantMessage } from '@/lib/chat/chat-messages';
import { resolveHydratedSendSource } from '@/lib/chat/start-product-chat';
import { resolveSendMessage } from '@/lib/chat/resolve-send-message';
import { syncAnchorSessionForTurn } from '@/lib/chat/anchor-turn-state';
import { CHAT_DEFAULT_LOCALE } from '@/lib/constants/chat';

export interface UseChatSessionOptions {
  conversationId?: string;
  /** Legacy entry-only `?q=` from /chat — not used on /chat/{id}. */
  urlQuery?: string;
  /** Unique bootstrap entry id from `?entry=` — one per external navigation. */
  entryId?: string;
  /** Legacy entry-only `?category=` — backward-compatible shop context from URL. */
  legacyShopCategory?: ShopCategory;
}

type RestoreStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useChatSession({
  conversationId,
  urlQuery = '',
  entryId,
  legacyShopCategory,
}: UseChatSessionOptions = {}) {
  const router = useRouter();
  const [state, dispatch] = useReducer(chatSessionReducer, initialChatSessionState);
  const [draft, setDraft] = useState('');
  const [restoreStatus, setRestoreStatus] = useState<RestoreStatus>(
    conversationId ? 'loading' : 'idle',
  );
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [bootstrapUnavailable, setBootstrapUnavailable] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;

  const sessionIdRef = useRef<string | null>(null);
  const requestGenerationRef = useRef(0);
  const legacyEntryStartedRef = useRef(false);
  const legacyEnsureEntryIdRef = useRef<string | null>(null);
  const conversationSessionRef = useRef<{
    conversationId: string;
    anonymousToken: string;
  } | null>(
    conversationId ? resolveConversationSession(conversationId) : null,
  );
  const shopCategoryRef = useRef<ShopCategory | undefined>(legacyShopCategory);

  useEffect(() => {
    if (legacyShopCategory) {
      shopCategoryRef.current = legacyShopCategory;
    }
  }, [legacyShopCategory]);

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

  const resolveOrCreateConversationSession = useCallback(async () => {
    const existing =
      conversationSessionRef.current ??
      (conversationId ? resolveConversationSession(conversationId) : null);

    if (existing) {
      conversationSessionRef.current = existing;
      return existing;
    }

    if (conversationId) {
      throw new Error('conversation_token_missing');
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
      const session = await resolveOrCreateConversationSession();

      return sendConversationTurn({
        message,
        context: mergedContext,
        conversationId: session.conversationId,
        anonymousToken: session.anonymousToken,
        clientTurnId: clientTurnId ?? crypto.randomUUID(),
        sessionId: getSessionId(),
        locale: CHAT_DEFAULT_LOCALE,
      });
    },
    [getSessionId, resolveOrCreateConversationSession],
  );

  const sendMessage = useCallback(
    async (input: SendMessageInput) => {
      const trimmed = input.query.trim();
      if (!trimmed) {
        return;
      }

      const current = stateRef.current;
      const inFlight = current.activeTurn;
      const hasPendingAssistant = current.messages.some(isPendingAssistantMessage);

      if (hasPendingAssistant && inFlight && inFlight.query !== trimmed) {
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
      let clientTurnId: string;

      if (inFlight?.query === trimmed) {
        turnId = inFlight.id;
        clientTurnId = inFlight.clientTurnId;
        dispatch({ type: 'TURN_RETRY_PENDING', turnId: inFlight.id });
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
    [requestTurn],
  );

  const selectSuggestion = useCallback(
    (query: string, sourceMessageId: string) => {
      if (stateRef.current.messages.some(isPendingAssistantMessage)) {
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
    legacyEnsureEntryIdRef.current = null;
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
    router.replace('/chat', { scroll: false });
  }, [router]);

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

    if (
      shouldSkipConversationRestore({
        conversationId,
        sessionConversationId: conversationSessionRef.current?.conversationId,
        messageCount: stateRef.current.messages.length,
        hasActiveTurn: stateRef.current.activeTurn !== null,
      })
    ) {
      setRestoreStatus('ready');
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
    if (conversationId || !trimmed) {
      setBootstrapUnavailable(false);
      return;
    }

    if (!entryId) {
      if (!legacyEnsureEntryIdRef.current) {
        const legacyEntry = createLegacyBootstrapEntry({
          query: trimmed,
          legacyShopCategory,
        });
        legacyEnsureEntryIdRef.current = legacyEntry.entryId;
        router.replace(
          buildLegacyChatEntryUrl({
            query: trimmed,
            entryId: legacyEntry.entryId,
            legacyShopCategory,
          }),
          { scroll: false },
        );
      }
      setBootstrapUnavailable(false);
      return;
    }

    const hydrationDecision = shouldHydrateBootstrapEntry({
      entryId,
      query: trimmed,
      messages: stateRef.current.messages,
    });

    if (hydrationDecision === 'unavailable') {
      setBootstrapUnavailable(true);
      return;
    }

    setBootstrapUnavailable(false);

    if (hydrationDecision === 'skip' || legacyEntryStartedRef.current) {
      return;
    }

    const claimed = tryClaimBootstrapEntry(entryId);
    if (!claimed) {
      return;
    }

    legacyEntryStartedRef.current = true;

    const anchorPreview = anchorPreviewFromPendingEntry(claimed);
    const shopCategory =
      claimed.legacyShopCategory ?? legacyShopCategory ?? undefined;

    if (shopCategory) {
      shopCategoryRef.current = shopCategory;
    }

    void (async () => {
      try {
        const source = resolveHydratedSendSource(trimmed, anchorPreview);
        await sendMessage({
          query: trimmed,
          source,
          context: anchorPreview
            ? { productId: anchorPreview.productId }
            : shopCategory
              ? { shopCategory }
              : undefined,
          anchorPreview,
          clientTurnId: claimed.clientTurnId,
        });
        completeBootstrapEntry(entryId);
      } catch {
        releaseBootstrapEntryClaim(entryId);
        legacyEntryStartedRef.current = false;
      }
    })();
  }, [
    conversationId,
    entryId,
    legacyShopCategory,
    router,
    sendMessage,
    urlQuery,
  ]);

  const isBusy = state.messages.some(isPendingAssistantMessage);
  const isRestoring = restoreStatus === 'loading';
  const showLanding =
    !conversationId &&
    state.messages.length === 0 &&
    (!urlQuery.trim() || bootstrapUnavailable) &&
    !isRestoring &&
    !isBusy;

  const hideFooter = shouldHideChatFooter({
    messageCount: state.messages.length,
    urlQuery,
    conversationId,
    isRestoring,
  });

  return {
    messages: state.messages,
    draft,
    setDraft,
    isBusy,
    isRestoring,
    restoreError,
    showLanding,
    hideFooter,
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
