'use client';

import { useEffect, useRef } from 'react';
import { ProductGrid } from '@/components/product-grid';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface SearchChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** Products shown for this search turn (assistant messages only). */
  products?: Product[];
  query?: string;
}

interface SearchChatThreadProps {
  messages: SearchChatMessage[];
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

export function SearchChatThread({ messages }: SearchChatThreadProps) {
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
                  ? `Products for "${message.query}"`
                  : 'Search results'
              }
            >
              <ProductGrid
                products={message.products}
                emptyMessage={
                  message.query
                    ? `No products found for "${message.query}"`
                    : 'No products found'
                }
              />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
