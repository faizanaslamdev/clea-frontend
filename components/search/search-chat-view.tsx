'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HeroSearchForm } from '@/components/hero-search-form';
import {
  SearchChatThread,
  type SearchChatMessage,
} from '@/components/search/search-chat-thread';
import { SearchLanding } from '@/components/search/search-landing';
import { LoadingBlock } from '@/components/shared/loading-block';
import { buildSearchAssistantReply } from '@/lib/domain/search/chat-reply';
import { resolveProductSearch } from '@/lib/services';
import type { Product } from '@/lib/types';

function createMessage(
  role: SearchChatMessage['role'],
  content: string,
  options?: Pick<
    SearchChatMessage,
    'products' | 'query' | 'searchTotal' | 'searchHasMore'
  >,
): SearchChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    ...options,
  };
}

function buildTurnMessages(
  query: string,
  products: Product[],
  usedFallback: boolean,
  total: number,
  hasMore: boolean,
) {
  const trimmed = query.trim();
  return [
    createMessage('user', trimmed),
    createMessage(
      'assistant',
      buildSearchAssistantReply(trimmed, usedFallback ? products.length : total, {
        usedFallback,
      }),
      {
        products,
        query: trimmed,
        searchTotal: usedFallback ? products.length : total,
        searchHasMore: hasMore,
      },
    ),
  ];
}

export function SearchChatView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q')?.trim() ?? '';

  const [messages, setMessages] = useState<SearchChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loadingMoreMessageId, setLoadingMoreMessageId] = useState<string | null>(
    null,
  );

  const syncUrl = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set('q', query);
      else params.delete('q');
      const qs = params.toString();
      router.replace(qs ? `/chat?${qs}` : '/chat', { scroll: false });
    },
    [router, searchParams],
  );

  const runSearch = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      setIsSearching(true);
      syncUrl(trimmed);

      try {
        const { results, usedFallback, total, hasMore } =
          await resolveProductSearch(trimmed);
        const products = results.map((r) => r.product);
        setMessages((prev) => [
          ...prev,
          ...buildTurnMessages(trimmed, products, usedFallback, total, hasMore),
        ]);
        setDraft('');
      } finally {
        setIsSearching(false);
      }
    },
    [syncUrl],
  );

  useEffect(() => {
    if (!urlQuery || messages.length > 0) return;

    let cancelled = false;
    setIsSearching(true);

    resolveProductSearch(urlQuery)
      .then(({ results, usedFallback, total, hasMore }) => {
        if (cancelled) return;
        const products = results.map((r) => r.product);
        setMessages(buildTurnMessages(urlQuery, products, usedFallback, total, hasMore));
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [urlQuery, messages.length]);

  const handleSubmitQuery = (trimmed: string) => {
    void runSearch(trimmed);
  };

  const handleLoadMoreSearch = useCallback(
    async (messageId: string) => {
      const target = messages.find((m) => m.id === messageId);
      if (!target?.query || !target.products?.length) return;

      setLoadingMoreMessageId(messageId);
      try {
        const { results, total, hasMore } = await resolveProductSearch(
          target.query,
          { offset: target.products.length },
        );
        const nextProducts = results.map((r) => r.product);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId && m.products
              ? {
                  ...m,
                  products: [...m.products, ...nextProducts],
                  searchTotal: total,
                  searchHasMore: hasMore,
                }
              : m,
          ),
        );
      } finally {
        setLoadingMoreMessageId(null);
      }
    },
    [messages],
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
    <div className="chat-page">
      <div className="chat-page__body section-container">
        {isSearching && messages.length === 0 ? (
          <LoadingBlock className="h-64" />
        ) : (
          <SearchChatThread
            messages={messages}
            onLoadMoreSearch={(id) => void handleLoadMoreSearch(id)}
            loadingMoreMessageId={loadingMoreMessageId}
          />
        )}
      </div>

      <HeroSearchForm
        variant="compact"
        size="large"
        idPrefix="chat-composer"
        className="chat-page__composer"
        value={draft}
        onValueChange={setDraft}
        onSubmitQuery={handleSubmitQuery}
      />
    </div>
  );
}
