'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatAnchorProvider } from '@/components/chat/chat-anchor-provider';
import { ChatNewChatButton } from '@/components/search/chat-new-chat-button';
import { HeroSearchForm } from '@/components/hero-search-form';
import {
  SearchChatThread,
  type SearchChatMessage,
} from '@/components/search/search-chat-thread';
import { SearchLanding } from '@/components/search/search-landing';
import { LoadingBlock } from '@/components/shared/loading-block';
import {
  fetchChatTurn,
  getOrCreateChatSessionId,
  resetChatSessionId,
} from '@/lib/api/chat';
import type {
  ChatTurnRequest,
  ChatTurnResult,
} from '@/lib/api/chat-types';
import {
  anchorMessageForKind,
  reconcileAnchorSessionForMessage,
  type ChatAnchorKind,
} from '@/lib/chat/anchor-actions';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import { findAnchorPreviewInMessages } from '@/lib/chat/anchor-preview';
import {
  buildErrorTurnMessagePair,
  buildTurnMessagePair,
} from '@/lib/chat/chat-messages';
import { performChatReset } from '@/lib/chat/chat-reset';
import {
  shouldClearActiveProductId,
  syncAnchorSessionForTurn,
} from '@/lib/chat/anchor-turn-state';
import { CHAT_SEARCH_ERROR_MESSAGE } from '@/lib/constants/chat';

export function SearchChatView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q')?.trim() ?? '';
  const sessionIdRef = useRef<string | null>(null);
  const turnGenerationRef = useRef(0);

  const [messages, setMessages] = useState<SearchChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loadingMoreMessageId, setLoadingMoreMessageId] = useState<string | null>(
    null,
  );
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  const getSessionId = useCallback(() => {
    sessionIdRef.current ??= getOrCreateChatSessionId();
    return sessionIdRef.current;
  }, []);

  const syncUrl = useCallback(
    (query: string) => {
      if (query) {
        router.replace(`/chat?q=${encodeURIComponent(query)}`, { scroll: false });
        return;
      }

      router.replace('/chat', { scroll: false });
    },
    [router],
  );

  const requestTurn = useCallback(
    async (message: string, context?: ChatTurnRequest['context']) => {
      return fetchChatTurn({
        message,
        context,
        sessionId: getSessionId(),
        locale: 'nb',
      });
    },
    [getSessionId],
  );

  const applyTurnResult = useCallback(
    (
      query: string,
      turn: ChatTurnResult,
      options?: { anchorPreview?: AnchorPreview },
    ) => {
      setMessages((prev) => [
        ...prev,
        ...buildTurnMessagePair(query, turn, options),
      ]);
      if (turn.anchorProductId) {
        setActiveProductId(turn.anchorProductId);
      }
    },
    [],
  );

  const appendErrorTurn = useCallback(
    (query: string, options?: { anchorPreview?: AnchorPreview }) => {
      setMessages((prev) => [
        ...prev,
        ...buildErrorTurnMessagePair(query, CHAT_SEARCH_ERROR_MESSAGE, options),
      ]);
    },
    [],
  );

  const runTurn = useCallback(
    async (
      query: string,
      context?: ChatTurnRequest['context'],
      options?: {
        syncQueryToUrl?: boolean;
        persistAnchor?: boolean;
        anchorPreview?: AnchorPreview;
      },
    ) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      const turnGeneration = turnGenerationRef.current + 1;
      turnGenerationRef.current = turnGeneration;

      setIsSearching(true);
      if (options?.syncQueryToUrl !== false) {
        syncUrl(trimmed);
      }

      if (shouldClearActiveProductId(context)) {
        setActiveProductId(null);
      }

      syncAnchorSessionForTurn(context, trimmed, options);

      try {
        const turn = await requestTurn(trimmed, context);
        if (turnGenerationRef.current !== turnGeneration) return;
        applyTurnResult(trimmed, turn, options);
        setDraft('');
      } catch {
        if (turnGenerationRef.current !== turnGeneration) return;
        appendErrorTurn(trimmed, options);
      } finally {
        if (turnGenerationRef.current === turnGeneration) {
          setIsSearching(false);
        }
      }
    },
    [appendErrorTurn, applyTurnResult, requestTurn, syncUrl],
  );

  const runSearch = useCallback(
    async (query: string) => {
      await runTurn(query);
    },
    [runTurn],
  );

  const runAnchorAction = useCallback(
    async (
      productId: string,
      kind: ChatAnchorKind,
      preview?: AnchorPreview,
    ) => {
      const message = anchorMessageForKind(kind);
      setActiveProductId(productId);
      await runTurn(message, { productId }, { anchorPreview: preview });
    },
    [runTurn],
  );

  const handleNewChat = useCallback(() => {
    turnGenerationRef.current += 1;
    setIsSearching(false);
    setLoadingMoreMessageId(null);
    setMessages([]);
    setDraft('');
    setActiveProductId(null);

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

  useEffect(() => {
    if (!urlQuery || messages.length > 0) return;

    let cancelled = false;
    const turnGeneration = turnGenerationRef.current + 1;
    turnGenerationRef.current = turnGeneration;
    setIsSearching(true);

    const anchorPreview = reconcileAnchorSessionForMessage(urlQuery);
    if (anchorPreview) {
      setActiveProductId(anchorPreview.productId);
    } else {
      setActiveProductId(null);
    }

    requestTurn(
      urlQuery,
      anchorPreview ? { productId: anchorPreview.productId } : undefined,
    )
      .then((turn) => {
        if (cancelled || turnGenerationRef.current !== turnGeneration) return;
        setMessages(
          buildTurnMessagePair(urlQuery, turn, {
            anchorPreview,
          }),
        );
        if (turn.anchorProductId) {
          setActiveProductId(turn.anchorProductId);
        }
      })
      .catch(() => {
        if (cancelled || turnGenerationRef.current !== turnGeneration) return;
        appendErrorTurn(urlQuery, { anchorPreview });
      })
      .finally(() => {
        if (!cancelled && turnGenerationRef.current === turnGeneration) {
          setIsSearching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [appendErrorTurn, messages.length, requestTurn, urlQuery]);

  const handleSubmitQuery = (trimmed: string) => {
    void runSearch(trimmed);
  };

  const handleSuggestionSelect = useCallback(
    (query: string, sourceMessageId: string) => {
      const sourceMessage = messages.find((message) => message.id === sourceMessageId);

      setMessages((prev) =>
        prev.map((message) =>
          message.id === sourceMessageId
            ? { ...message, suggestions: undefined }
            : message,
        ),
      );

      const productId =
        activeProductId ?? sourceMessage?.anchorProductId ?? undefined;
      const anchorPreview = productId
        ? findAnchorPreviewInMessages(messages, productId)
        : undefined;

      void runTurn(
        query,
        productId ? { productId } : undefined,
        anchorPreview ? { anchorPreview } : undefined,
      );
    },
    [activeProductId, messages, runTurn],
  );

  const handleLoadMoreSearch = useCallback(
    async (messageId: string) => {
      const target = messages.find((m) => m.id === messageId);
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

      setLoadingMoreMessageId(messageId);
      try {
        const turn = await requestTurn('', {
          intent: target.intent ?? 'product_search',
          catalog: {
            ...target.catalogQuery,
            offset: nextOffset,
          },
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  products: [...(m.products ?? []), ...turn.products],
                  searchTotal: turn.total,
                  searchHasMore: turn.hasMore,
                  searchLimit: turn.limit,
                  catalogQuery: turn.catalogQuery ?? {
                    ...target.catalogQuery,
                    offset: nextOffset,
                  },
                }
              : m,
          ),
        );
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: CHAT_SEARCH_ERROR_MESSAGE,
          },
        ]);
      } finally {
        setLoadingMoreMessageId(null);
      }
    },
    [messages, requestTurn],
  );

  const showLanding = !urlQuery && messages.length === 0;

  if (showLanding) {
    return (
      <div className="chat-page chat-page--landing">
        <SearchLanding />
      </div>
    );
  }

  return (
    <ChatAnchorProvider
      runAnchorAction={runAnchorAction}
      isAnchorLoading={isSearching}
      activeProductId={activeProductId}
      onActiveProductIdChange={setActiveProductId}
    >
      <div className="chat-page">
        <div className="chat-page__body section-container">
          {isSearching && messages.length === 0 ? (
            <LoadingBlock className="h-64" />
          ) : (
            <SearchChatThread
              messages={messages}
              activeProductId={activeProductId}
              onLoadMoreSearch={(id) => void handleLoadMoreSearch(id)}
              onSuggestionSelect={handleSuggestionSelect}
              loadingMoreMessageId={loadingMoreMessageId}
            />
          )}
        </div>

        <div className="chat-page__composer-dock">
          <HeroSearchForm
            variant="compact"
            size="large"
            idPrefix="chat-composer"
            className="chat-page__composer"
            value={draft}
            onValueChange={setDraft}
            onSubmitQuery={handleSubmitQuery}
          />
          <ChatNewChatButton
            onNewChat={handleNewChat}
            disabled={isSearching}
          />
        </div>
      </div>
    </ChatAnchorProvider>
  );
}
