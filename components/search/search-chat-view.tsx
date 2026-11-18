'use client';

import { useCallback, useEffect } from 'react';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import { ChatAnchorProvider } from '@/components/chat/chat-anchor-provider';
import { ChatNewChatButton } from '@/components/search/chat-new-chat-button';
import { HeroSearchForm } from '@/components/hero-search-form';
import { SearchChatThread } from '@/components/search/search-chat-thread';
import { SearchLanding } from '@/components/search/search-landing';
import { useChatSessionContext } from '@/lib/chat/chat-session-provider';
import { takePendingPhoto } from '@/lib/photo/pending-photo';

export function SearchChatView() {
  const {
    messages,
    draft,
    setDraft,
    isBusy,
    isRestoring,
    restoreError,
    showLanding,
    activeProductId,
    setActiveProductId,
    loadingMoreMessageId,
    sendMessage,
    sendPhoto,
    selectSuggestion,
    runAnchorAction,
    loadMore,
    reset,
  } = useChatSessionContext();

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

  // A photo picked on the homepage waits for the chat to open, then goes out once.
  useEffect(() => {
    const pending = takePendingPhoto();
    if (pending) {
      void sendPhoto(pending.dataUrl, pending.shopCategory);
    }
  }, [sendPhoto]);

  if (showLanding) {
    return (
      <div className="chat-page chat-page--landing">
        <SearchLanding />
      </div>
    );
  }

  if (restoreError) {
    return (
      <div className="chat-page chat-page--landing">
        <p>{restoreError}</p>
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
            interactionDisabled={isBusy || isRestoring}
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
            photoSearch
            onSubmitPhoto={(dataUrl) => void sendPhoto(dataUrl)}
            submitLocked={isBusy || isRestoring}
          />
          <ChatNewChatButton onNewChat={reset} disabled={isBusy || isRestoring} />
        </div>
      </div>
    </ChatAnchorProvider>
  );
}
