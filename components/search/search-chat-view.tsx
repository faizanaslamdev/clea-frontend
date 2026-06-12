'use client';

import { useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import { ChatAnchorProvider } from '@/components/chat/chat-anchor-provider';
import { ChatNewChatButton } from '@/components/search/chat-new-chat-button';
import { HeroSearchForm } from '@/components/hero-search-form';
import { SearchChatThread } from '@/components/search/search-chat-thread';
import { SearchLanding } from '@/components/search/search-landing';
import { useChatSession } from '@/lib/hooks/useChatSession';
import { parseShopCategory } from '@/lib/chat/shop-category';

export function SearchChatView() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q')?.trim() ?? '';
  const urlShopCategory = parseShopCategory(searchParams.get('category'));

  const {
    messages,
    draft,
    setDraft,
    isBusy,
    showLanding,
    activeProductId,
    setActiveProductId,
    loadingMoreMessageId,
    sendMessage,
    selectSuggestion,
    runAnchorAction,
    loadMore,
    reset,
  } = useChatSession({ urlQuery, urlShopCategory });

  const sendProductMessage = useCallback(
    async (query: string, productId: string, preview?: AnchorPreview) => {
      setActiveProductId(productId);
      await sendMessage({
        query,
        source: 'product-card',
        context: { productId },
        anchorPreview: preview,
      });
    },
    [sendMessage, setActiveProductId],
  );

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
      sendProductMessage={sendProductMessage}
      isAnchorLoading={isBusy}
      activeProductId={activeProductId}
      onActiveProductIdChange={setActiveProductId}
    >
      <div className="chat-page">
        <div className="chat-page__body section-container">
          <SearchChatThread
            messages={messages}
            activeProductId={activeProductId}
            onLoadMoreSearch={(id) => void loadMore(id)}
            onSuggestionSelect={selectSuggestion}
            loadingMoreMessageId={loadingMoreMessageId}
            interactionDisabled={isBusy}
          />
        </div>

        <div className="chat-page__composer-dock">
          <HeroSearchForm
            variant="compact"
            size="large"
            appearance="floating"
            idPrefix="chat-composer"
            className="chat-page__composer"
            placeholder="Skriv for å finjustere …"
            value={draft}
            onValueChange={setDraft}
            onSubmitQuery={(query) => void sendMessage({ query })}
            submitLocked={isBusy}
          />
          <ChatNewChatButton onNewChat={reset} disabled={isBusy} />
        </div>
      </div>
    </ChatAnchorProvider>
  );
}
