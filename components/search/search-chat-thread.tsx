import { ProductGrid } from '@/components/product-grid';
import { SearchChatUserDemo } from '@/components/search/search-chat-user-demo';
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

export function SearchChatThread({ messages }: SearchChatThreadProps) {
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
            className={cn(
              message.role === 'user' && 'search-chat-thread__user-turn',
            )}
          >
            <div
              className={cn(
                'search-chat-bubble',
                message.role === 'user'
                  ? 'search-chat-bubble--user'
                  : 'search-chat-bubble--assistant',
              )}
            >
              <p>{message.content}</p>
            </div>
            {message.role === 'user' ? (
              <SearchChatUserDemo query={message.content} />
            ) : null}
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
