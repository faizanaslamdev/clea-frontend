'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { ChatAnchorUserBubble } from '@/components/search/chat-anchor-user-bubble';
import { ProductGrid } from '@/components/product-grid';
import { SearchSuggestionChips } from '@/components/search/search-suggestion-chips';
import { LoadMoreButton } from '@/components/shared/load-more-button';
import { ChatTypingIndicator } from '@/components/search/chat-typing-indicator';
import { filterSuggestionsForAnchor } from '@/lib/chat/anchor-actions';
import {
  CHAT_RESULTS_INTRINSIC_REVEAL_CLASS,
  clearRevealOnTransitionEnd,
  prefersReducedResultsMotion,
  shouldUseIntrinsicResultsReveal,
  trackFreshResultsReveal,
  type IntrinsicResultsRevealTarget,
} from '@/lib/chat/chat-results-reveal';
import {
  isPendingAssistantMessage,
  isProductReferenceUserMessage,
  type SearchChatMessageData,
} from '@/lib/chat/chat-messages';
import { cn } from '@/lib/utils';

export type SearchChatMessage = SearchChatMessageData;

interface SearchChatThreadProps {
  messages: SearchChatMessage[];
  activeProductId?: string | null;
  onLoadMoreSearch?: (messageId: string) => void;
  onSuggestionSelect?: (query: string, messageId: string) => void;
  loadingMoreMessageId?: string | null;
  interactionDisabled?: boolean;
}

function scrollToLatestMessage(messageEl: HTMLElement | null) {
  if (!messageEl) return;
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  messageEl.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  });
}

function shouldShowLoadMore(message: SearchChatMessage): boolean {
  return (
    message.searchHasMore === true &&
    message.intent === 'product_search'
  );
}

export function SearchChatThread({
  messages,
  activeProductId = null,
  onLoadMoreSearch,
  onSuggestionSelect,
  loadingMoreMessageId = null,
  interactionDisabled = false,
}: SearchChatThreadProps) {
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const pendingAssistantMessageIdRef = useRef<string | null>(null);
  const revealTargetRef = useRef<IntrinsicResultsRevealTarget | null>(null);
  const activeRevealNodeRef = useRef<HTMLDivElement | null>(null);
  const expandAnimationFrameRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const [, bumpRevealRender] = useState(0);
  const latestMessageId = messages.at(-1)?.id;
  const latestAssistantMessageId = [...messages]
    .reverse()
    .find(
      (message) =>
        message.role === 'assistant' && !isPendingAssistantMessage(message),
    )?.id;

  const freshResultsReveal = trackFreshResultsReveal(
    messages,
    pendingAssistantMessageIdRef.current,
    revealTargetRef.current?.messageId ?? null,
  );

  if (
    freshResultsReveal.newlyRevealedMessageId &&
    !prefersReducedResultsMotion() &&
    revealTargetRef.current?.messageId !==
      freshResultsReveal.newlyRevealedMessageId
  ) {
    revealTargetRef.current = {
      messageId: freshResultsReveal.newlyRevealedMessageId,
      collapsed: true,
    };
  }

  pendingAssistantMessageIdRef.current =
    freshResultsReveal.nextPendingAssistantMessageId;

  const revealTarget = revealTargetRef.current;
  const reduceMotion = prefersReducedResultsMotion();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (expandAnimationFrameRef.current != null) {
        cancelAnimationFrame(expandAnimationFrameRef.current);
        expandAnimationFrameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      revealTargetRef.current = null;
      pendingAssistantMessageIdRef.current = null;
      bumpRevealRender((value) => value + 1);
    }
  }, [messages.length]);

  useLayoutEffect(() => {
    const target = revealTargetRef.current;
    if (!target?.collapsed || prefersReducedResultsMotion()) {
      return;
    }

    if (expandAnimationFrameRef.current != null) {
      return;
    }

    const { messageId } = target;
    expandAnimationFrameRef.current = requestAnimationFrame(() => {
      expandAnimationFrameRef.current = null;
      if (!mountedRef.current) {
        return;
      }

      if (revealTargetRef.current?.messageId === messageId) {
        revealTargetRef.current = { messageId, collapsed: false };
        bumpRevealRender((value) => value + 1);
      }
    });

    return () => {
      if (expandAnimationFrameRef.current != null) {
        cancelAnimationFrame(expandAnimationFrameRef.current);
        expandAnimationFrameRef.current = null;
      }
    };
  }, [messages, freshResultsReveal.newlyRevealedMessageId]);

  useLayoutEffect(() => {
    const target = revealTargetRef.current;
    const node = activeRevealNodeRef.current;
    if (!target || target.collapsed || !node) {
      return;
    }

    const finalizeReveal = () => {
      if (revealTargetRef.current?.messageId !== target.messageId) {
        return;
      }

      revealTargetRef.current = null;
      bumpRevealRender((value) => value + 1);
    };

    const onTransitionEnd = (event: Event) => {
      if (event.target !== node) {
        return;
      }

      const propertyName =
        'propertyName' in event
          ? String((event as Event & { propertyName?: string }).propertyName ?? '')
          : '';

      if (
        clearRevealOnTransitionEnd(
          revealTargetRef.current,
          target.messageId,
          propertyName,
        ) === null
      ) {
        finalizeReveal();
      }
    };

    node.addEventListener('transitionend', onTransitionEnd);
    return () => node.removeEventListener('transitionend', onTransitionEnd);
  }, [revealTarget?.messageId, revealTarget?.collapsed]);

  // Scroll only when a new turn is appended — not when an existing message
  // is updated (e.g. load-more appending products to the same bubble).
  useEffect(() => {
    if (!latestMessageId) return;
    scrollToLatestMessage(latestMessageRef.current);
  }, [latestMessageId]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <ul className="search-chat-thread" aria-live="polite">
      {messages.map((message) => {
        const anchorForChips =
          activeProductId ?? message.anchorProductId ?? undefined;
        const visibleSuggestions = filterSuggestionsForAnchor(
          message.suggestions,
          anchorForChips,
        );
        const isAnchorReference = isProductReferenceUserMessage(message);
        const useIntrinsicReveal =
          !reduceMotion &&
          shouldUseIntrinsicResultsReveal(message.id, revealTarget);
        const isIntrinsicCollapsed =
          useIntrinsicReveal && revealTarget?.collapsed === true;

        const resultsContent =
          message.role === 'assistant' &&
          message.products &&
          message.products.length > 0 ? (
            <div
              className="search-chat-thread__results"
              aria-label={
                message.query
                  ? `Produkter for «${message.query}»`
                  : 'Søkeresultater'
              }
            >
              {message.searchTotal != null && message.searchTotal > 0 ? (
                <p className="mb-4 text-sm text-muted-foreground">
                  Viser {message.products.length} av {message.searchTotal}{' '}
                  produkter
                </p>
              ) : null}
              <ProductGrid
                products={message.products}
                enableAnchorActions
                showMerchantLabel
                emptyMessage={
                  message.query
                    ? `Ingen produkter funnet for «${message.query}»`
                    : 'Ingen produkter funnet'
                  }
              />
              {shouldShowLoadMore(message) && onLoadMoreSearch ? (
                <LoadMoreButton
                  onClick={() => onLoadMoreSearch(message.id)}
                  loading={loadingMoreMessageId === message.id}
                  disabled={interactionDisabled}
                />
              ) : null}
            </div>
          ) : null;

        return (
          <li
            key={message.id}
            className={cn(
              'search-chat-thread__item',
              message.role === 'user'
                ? 'search-chat-thread__item--user'
                : 'search-chat-thread__item--assistant',
            )}
          >
            <div
              ref={message.id === latestMessageId ? latestMessageRef : undefined}
              className={cn(
                'search-chat-bubble',
                message.id === latestMessageId && 'search-chat-bubble--scroll-target',
                isAnchorReference
                  ? 'search-chat-bubble--anchor-ref'
                  : message.role === 'user'
                    ? 'search-chat-bubble--user'
                    : 'search-chat-bubble--assistant',
              )}
            >
              {isPendingAssistantMessage(message) ? (
                <ChatTypingIndicator />
              ) : isAnchorReference && message.anchorPreview ? (
                <ChatAnchorUserBubble
                  preview={message.anchorPreview}
                  actionLabel={message.content}
                />
              ) : (
                <p>{message.content}</p>
              )}
            </div>
            {message.role === 'assistant' &&
            message.id === latestAssistantMessageId &&
            visibleSuggestions &&
            visibleSuggestions.length > 0 &&
            onSuggestionSelect ? (
              <SearchSuggestionChips
                suggestions={visibleSuggestions}
                ariaLabel="Forslag"
                className="search-chat-thread__suggestions"
                disabled={interactionDisabled}
                onSelect={(query) => onSuggestionSelect(query, message.id)}
              />
            ) : null}
            {resultsContent && useIntrinsicReveal ? (
              <div
                ref={activeRevealNodeRef}
                className={cn(
                  CHAT_RESULTS_INTRINSIC_REVEAL_CLASS,
                  isIntrinsicCollapsed &&
                    'search-chat-thread__results-reveal--collapsed',
                )}
              >
                <div className="search-chat-thread__results-reveal-inner">
                  {resultsContent}
                </div>
              </div>
            ) : (
              resultsContent
            )}
          </li>
        );
      })}
    </ul>
  );
}
