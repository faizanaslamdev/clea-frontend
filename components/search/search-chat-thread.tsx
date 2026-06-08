'use client';

import { useEffect, useRef } from 'react';
import { ProductGrid } from '@/components/product-grid';
import { LoadMoreButton } from '@/components/shared/load-more-button';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface SearchChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** Products shown for this search turn (assistant messages only). */
  products?: Product[];
  query?: string;
  searchTotal?: number;
  searchHasMore?: boolean;
}

interface SearchChatThreadProps {
  messages: SearchChatMessage[];
  onLoadMoreSearch?: (messageId: string) => void;
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

export function SearchChatThread({
  messages,
  onLoadMoreSearch,
  loadingMoreMessageId = null,
}: SearchChatThreadProps) {
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const latestMessageId = messages.at(-1)?.id;

  useEffect(() => {
    if (messages.length === 0) return;
    scrollToLatestMessage(latestMessageRef.current);
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <ul className="search-chat-thread" aria-live="polite">
      {messages.map((message) => (
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
            <p>{message.content}</p>
          </div>
          {message.role === 'assistant' && message.products ? (
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
                emptyMessage={
                  message.query
                    ? `Ingen produkter funnet for «${message.query}»`
                    : 'Ingen produkter funnet'
                }
              />
              {message.searchHasMore && onLoadMoreSearch ? (
                <LoadMoreButton
                  onClick={() => onLoadMoreSearch(message.id)}
                  loading={loadingMoreMessageId === message.id}
                />
              ) : null}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
