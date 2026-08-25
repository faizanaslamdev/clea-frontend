import { describe, expect, it } from 'vitest';
import type { SearchChatMessageData } from '@/lib/chat/chat-messages';
import {
  clearRevealOnTransitionEnd,
  findPendingAssistantMessageId,
  shouldUseIntrinsicResultsReveal,
  trackFreshResultsReveal,
} from '@/lib/chat/chat-results-reveal';

const PRODUCT = { id: 'p1' } as NonNullable<
  SearchChatMessageData['products']
>[number];

function assistant(
  id: string,
  options: Partial<SearchChatMessageData> = {},
): SearchChatMessageData {
  return {
    id,
    role: 'assistant',
    content: 'Here you go',
    status: 'complete',
    ...options,
  };
}

describe('trackFreshResultsReveal', () => {
  it('tracks fresh reveal when pending assistant completes with products', () => {
    const pendingId = 'assistant-1';
    const result = trackFreshResultsReveal(
      [assistant(pendingId, { products: [PRODUCT], query: 'shirt' })],
      pendingId,
      null,
    );

    expect(result.newlyRevealedMessageId).toBe(pendingId);
  });

  it('does not track restored complete messages', () => {
    const result = trackFreshResultsReveal(
      [assistant('assistant-restored', { products: [PRODUCT], query: 'dress' })],
      null,
      null,
    );

    expect(result.newlyRevealedMessageId).toBeNull();
  });

  it('does not re-track while the same message is actively revealing', () => {
    const pendingId = 'assistant-1';
    const result = trackFreshResultsReveal(
      [assistant(pendingId, { products: [PRODUCT], query: 'shirt' })],
      pendingId,
      pendingId,
    );

    expect(result.newlyRevealedMessageId).toBeNull();
  });

  it('allows a new reveal for a different pending turn', () => {
    const first = trackFreshResultsReveal(
      [assistant('assistant-1', { products: [PRODUCT], query: 'shirt' })],
      'assistant-1',
      null,
    );
    expect(first.newlyRevealedMessageId).toBe('assistant-1');

    const second = trackFreshResultsReveal(
      [
        assistant('assistant-1', { products: [PRODUCT], query: 'shirt' }),
        { id: 'user-2', role: 'user', content: 'dress' },
        assistant('assistant-2', { products: [PRODUCT], query: 'dress' }),
      ],
      'assistant-2',
      null,
    );

    expect(second.newlyRevealedMessageId).toBe('assistant-2');
  });

  it('ignores text-only completion', () => {
    const pendingId = 'assistant-1';
    const result = trackFreshResultsReveal(
      [assistant(pendingId)],
      pendingId,
      null,
    );

    expect(result.newlyRevealedMessageId).toBeNull();
  });
});

describe('findPendingAssistantMessageId', () => {
  it('returns the pending assistant id when one exists', () => {
    const messages: SearchChatMessageData[] = [
      { id: 'user-1', role: 'user', content: 'hello' },
      { id: 'assistant-1', role: 'assistant', content: '', status: 'pending' },
    ];

    expect(findPendingAssistantMessageId(messages)).toBe('assistant-1');
  });
});

describe('shouldUseIntrinsicResultsReveal', () => {
  it('returns true only for the active reveal target', () => {
    expect(
      shouldUseIntrinsicResultsReveal('assistant-1', {
        messageId: 'assistant-1',
        collapsed: true,
      }),
    ).toBe(true);
    expect(
      shouldUseIntrinsicResultsReveal('assistant-2', {
        messageId: 'assistant-1',
        collapsed: false,
      }),
    ).toBe(false);
  });
});

describe('clearRevealOnTransitionEnd', () => {
  it('clears the reveal target after grid-template-rows transition', () => {
    expect(
      clearRevealOnTransitionEnd(
        { messageId: 'assistant-1', collapsed: false },
        'assistant-1',
        'grid-template-rows',
      ),
    ).toBeNull();
  });

  it('ignores unrelated transition properties', () => {
    const target = { messageId: 'assistant-1', collapsed: false };
    expect(
      clearRevealOnTransitionEnd(target, 'assistant-1', 'opacity'),
    ).toBe(target);
  });
});
