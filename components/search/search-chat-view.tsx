'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HeroSearchForm } from '@/components/hero-search-form';
import {
  SearchChatThread,
  type SearchChatMessage,
} from '@/components/search/search-chat-thread';
import { SearchLanding } from '@/components/search/search-landing';
import { buildSearchAssistantReply } from '@/lib/domain/search/chat-reply';
import type { Product } from '@/lib/types';
import { resolveProductSearch } from '@/lib/services';

function createMessage(
  role: SearchChatMessage['role'],
  content: string,
  options?: { products?: Product[]; query?: string },
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
) {
  const trimmed = query.trim();
  return [
    createMessage('user', trimmed),
    createMessage(
      'assistant',
      buildSearchAssistantReply(trimmed, products.length, { usedFallback }),
      {
        products,
        query: trimmed,
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
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      const { results, usedFallback } = resolveProductSearch(trimmed);
      const products = results.map((r) => r.product);
      syncUrl(trimmed);

      setMessages((prev) => [
        ...prev,
        ...buildTurnMessages(trimmed, products, usedFallback),
      ]);
      setDraft('');
    },
    [syncUrl],
  );

  useEffect(() => {
    if (!urlQuery || messages.length > 0) return;

    const { results, usedFallback } = resolveProductSearch(urlQuery);
    const products = results.map((r) => r.product);
    setMessages(buildTurnMessages(urlQuery, products, usedFallback));
  }, [urlQuery, messages.length]);

  const handleSubmitQuery = (trimmed: string) => {
    runSearch(trimmed);
  };

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
        <SearchChatThread messages={messages} />
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
