import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SearchChatMessageData } from '@/lib/chat/chat-messages';
import { CHAT_RESULTS_INTRINSIC_REVEAL_CLASS } from '@/lib/chat/chat-results-reveal';
import { SearchChatThread } from './search-chat-thread';

const PRODUCT = { id: 'p1' } as NonNullable<
  SearchChatMessageData['products']
>[number];

vi.mock('@/components/product-grid', () => ({
  ProductGrid: ({ products }: { products: { id: string }[] }) => (
    <div data-testid="product-grid">{products.length} products</div>
  ),
}));

vi.mock('@/components/search/chat-typing-indicator', () => ({
  ChatTypingIndicator: () => <span data-testid="typing">typing</span>,
}));

vi.mock('@/components/search/search-suggestion-chips', () => ({
  SearchSuggestionChips: () => null,
}));

function assistantMessage(
  id: string,
  options: Partial<SearchChatMessageData> = {},
): SearchChatMessageData {
  return {
    id,
    role: 'assistant',
    content: 'Here are some options.',
    status: 'complete',
    ...options,
  };
}

describe('SearchChatThread intrinsic results reveal', () => {
  let container: HTMLDivElement;
  let root: Root;
  let animationFrameCallbacks: FrameRequestCallback[];

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
      true;
    if (typeof TransitionEvent === 'undefined') {
      class PolyfillTransitionEvent extends Event {
        readonly propertyName: string;

        constructor(type: string, init: { propertyName?: string; bubbles?: boolean } = {}) {
          super(type, init);
          this.propertyName = init.propertyName ?? '';
        }
      }
      vi.stubGlobal('TransitionEvent', PolyfillTransitionEvent);
    }
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    animationFrameCallbacks = [];
    Element.prototype.scrollIntoView = vi.fn();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      animationFrameCallbacks.push(callback);
      return animationFrameCallbacks.length;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      animationFrameCallbacks[id - 1] = (() => {}) as FrameRequestCallback;
    });
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await act(async () => root.unmount());
    container.remove();
  });

  async function renderThread(messages: SearchChatMessageData[]) {
    await act(async () => {
      root.render(<SearchChatThread messages={messages} />);
    });
  }

  async function flushRevealAnimation() {
    const callbacks = [...animationFrameCallbacks];
    animationFrameCallbacks = [];
    await act(async () => {
      for (const callback of callbacks) {
        callback(0);
      }
    });
  }

  async function finishRevealTransition() {
    const reveal = revealEl();
    if (!reveal) {
      return;
    }

    await act(async () => {
      const event = new Event('transitionend', { bubbles: true }) as Event & {
        propertyName: string;
      };
      event.propertyName = 'grid-template-rows';
      reveal.dispatchEvent(event);
    });
  }

  function revealEl() {
    return container.querySelector(`.${CHAT_RESULTS_INTRINSIC_REVEAL_CLASS}`);
  }

  function resultsEl() {
    return container.querySelector('.search-chat-thread__results');
  }

  it('uses intrinsic reveal wrapper when pending assistant completes with products', async () => {
    const assistantId = 'assistant-1';

    await renderThread([
      { id: 'user-1', role: 'user', content: 'shirt' },
      { id: assistantId, role: 'assistant', content: '', status: 'pending' },
    ]);

    expect(revealEl()).toBeNull();

    await renderThread([
      { id: 'user-1', role: 'user', content: 'shirt' },
      assistantMessage(assistantId, {
        products: [PRODUCT],
        query: 'shirt',
      }),
    ]);

    expect(revealEl()).not.toBeNull();
    expect(revealEl()?.classList.contains('search-chat-thread__results-reveal--collapsed')).toBe(true);

    await flushRevealAnimation();

    expect(revealEl()?.classList.contains('search-chat-thread__results-reveal--collapsed')).toBe(false);
    expect(resultsEl()).not.toBeNull();
  });

  it('does not use intrinsic reveal wrapper for restored complete messages', async () => {
    await renderThread([
      assistantMessage('assistant-restored', {
        products: [PRODUCT],
        query: 'dress',
      }),
    ]);

    expect(revealEl()).toBeNull();
    expect(resultsEl()).not.toBeNull();
  });

  it('returns to plain results after transition and keeps load-more stable', async () => {
    const assistantId = 'assistant-1';

    await renderThread([
      { id: 'user-1', role: 'user', content: 'shirt' },
      { id: assistantId, role: 'assistant', content: '', status: 'pending' },
    ]);

    await renderThread([
      { id: 'user-1', role: 'user', content: 'shirt' },
      assistantMessage(assistantId, {
        products: [PRODUCT],
        query: 'shirt',
        searchHasMore: true,
      }),
    ]);

    await flushRevealAnimation();
    await finishRevealTransition();

    expect(revealEl()).toBeNull();
    expect(resultsEl()).not.toBeNull();

    await renderThread([
      { id: 'user-1', role: 'user', content: 'shirt' },
      assistantMessage(assistantId, {
        products: [PRODUCT, { id: 'p2' } as typeof PRODUCT],
        query: 'shirt',
        searchHasMore: true,
      }),
    ]);

    expect(revealEl()).toBeNull();
    expect(container.querySelector('[data-testid="product-grid"]')?.textContent).toBe(
      '2 products',
    );
  });

  it('reveals each consecutive live product turn once', async () => {
    await renderThread([
      { id: 'user-1', role: 'user', content: 'shirt' },
      { id: 'assistant-1', role: 'assistant', content: '', status: 'pending' },
    ]);

    await renderThread([
      { id: 'user-1', role: 'user', content: 'shirt' },
      assistantMessage('assistant-1', { products: [PRODUCT], query: 'shirt' }),
    ]);

    expect(revealEl()).not.toBeNull();
    await flushRevealAnimation();
    await finishRevealTransition();
    expect(revealEl()).toBeNull();

    await renderThread([
      { id: 'user-1', role: 'user', content: 'shirt' },
      assistantMessage('assistant-1', { products: [PRODUCT], query: 'shirt' }),
      { id: 'user-2', role: 'user', content: 'dress' },
      { id: 'assistant-2', role: 'assistant', content: '', status: 'pending' },
    ]);

    await renderThread([
      { id: 'user-1', role: 'user', content: 'shirt' },
      assistantMessage('assistant-1', { products: [PRODUCT], query: 'shirt' }),
      { id: 'user-2', role: 'user', content: 'dress' },
      assistantMessage('assistant-2', { products: [PRODUCT], query: 'dress' }),
    ]);

    const revealNodes = container.querySelectorAll(
      `.${CHAT_RESULTS_INTRINSIC_REVEAL_CLASS}`,
    );
    expect(revealNodes).toHaveLength(1);
  });

  it('clears reveal tracking when the thread resets to empty', async () => {
    const assistantId = 'assistant-1';

    await renderThread([
      { id: 'user-1', role: 'user', content: 'shirt' },
      { id: assistantId, role: 'assistant', content: '', status: 'pending' },
    ]);

    await renderThread([
      { id: 'user-1', role: 'user', content: 'shirt' },
      assistantMessage(assistantId, { products: [PRODUCT], query: 'shirt' }),
    ]);

    await flushRevealAnimation();
    await renderThread([]);

    await renderThread([
      assistantMessage('assistant-restored', {
        products: [PRODUCT],
        query: 'restored',
      }),
    ]);

    expect(revealEl()).toBeNull();
  });

  it('leaves text-only responses without results', async () => {
    const assistantId = 'assistant-1';

    await renderThread([
      { id: 'user-1', role: 'user', content: 'hello' },
      { id: assistantId, role: 'assistant', content: '', status: 'pending' },
    ]);

    await renderThread([
      { id: 'user-1', role: 'user', content: 'hello' },
      assistantMessage(assistantId),
    ]);

    expect(revealEl()).toBeNull();
    expect(resultsEl()).toBeNull();
  });

  it('skips intrinsic reveal wrapper when reduced motion is enabled', async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const assistantId = 'assistant-1';

    await renderThread([
      { id: 'user-1', role: 'user', content: 'shirt' },
      { id: assistantId, role: 'assistant', content: '', status: 'pending' },
    ]);

    await renderThread([
      { id: 'user-1', role: 'user', content: 'shirt' },
      assistantMessage(assistantId, {
        products: [PRODUCT],
        query: 'shirt',
      }),
    ]);

    expect(revealEl()).toBeNull();
    expect(resultsEl()).not.toBeNull();
  });
});
