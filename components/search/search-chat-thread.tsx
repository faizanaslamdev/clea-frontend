'use client';

import { useEffect, useRef } from 'react';
import { ChatAnchorUserBubble } from '@/components/search/chat-anchor-user-bubble';
import { ProductGrid } from '@/components/product-grid';
import { SearchSuggestionChips } from '@/components/search/search-suggestion-chips';
import { LoadMoreButton } from '@/components/shared/load-more-button';
import { filterSuggestionsForAnchor } from '@/lib/chat/anchor-actions';
import { isAnchorActionMessage } from '@/lib/chat/anchor-preview';
import type { SearchChatMessageData } from '@/lib/chat/chat-messages';
import { cn } from '@/lib/utils';

export type SearchChatMessage = SearchChatMessageData;

interface SearchChatThreadProps {
  messages: SearchChatMessage[];
  activeProductId?: string | null;
  onLoadMoreSearch?: (messageId: string) => void;
  onSuggestionSelect?: (query: string, messageId: string) => void;
  loadingMoreMessageId?: string | null;
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
}: SearchChatThreadProps) {
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const latestMessageId = messages.at(-1)?.id;
  const latestAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant')?.id;

  useEffect(() => {
    if (messages.length === 0) return;
    scrollToLatestMessage(latestMessageRef.current);
  }, [messages]);

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
                message.role === 'user'
                  ? 'search-chat-bubble--user'
                  : 'search-chat-bubble--assistant',
              )}
            >
              {message.role === 'user' &&
              message.anchorPreview &&
              isAnchorActionMessage(message.content) ? (
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
                onSelect={(query) => onSuggestionSelect(query, message.id)}
              />
            ) : null}
            {message.role === 'assistant' &&
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
                    Viser {message.products.length} av {message.searchTotal} produkter
                  </p>
                ) : null}
                <ProductGrid
                  products={message.products}
                  enableAnchorActions
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
                  />
                ) : null}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
