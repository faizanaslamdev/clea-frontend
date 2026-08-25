import { afterEach, describe, expect, it } from 'vitest';
import {
  buildUrlHydrationSignature,
  CHAT_THREAD_STORAGE_KEY,
  restorePersistedChatThread,
  shouldHydrateUrlQuery,
  threadContainsUserQuery,
} from '@/lib/chat/chat-thread-persistence';

describe('buildUrlHydrationSignature', () => {
  it('normalizes query casing and includes shop category', () => {
    expect(buildUrlHydrationSignature('Svart hettegenser', 'mens')).toBe(
      'svart hettegenser|mens',
    );
    expect(buildUrlHydrationSignature('Black hoodie')).toBe('black hoodie|');
  });
});

describe('threadContainsUserQuery', () => {
  it('detects an existing user bubble for the same query', () => {
    expect(
      threadContainsUserQuery(
        [{ id: '1', role: 'user', content: 'Svart hettegenser' }],
        'svart hettegenser',
      ),
    ).toBe(true);
  });
});

describe('shouldHydrateUrlQuery', () => {
  it('allows the first hydration for a new URL signature', () => {
    expect(
      shouldHydrateUrlQuery({
        query: 'Svart hettegenser',
        shopCategory: 'mens',
        messages: [],
        hydratedSignatures: [],
      }),
    ).toBe(true);
  });

  it('blocks re-hydration when the signature was already consumed', () => {
    expect(
      shouldHydrateUrlQuery({
        query: 'Svart hettegenser',
        shopCategory: 'mens',
        messages: [],
        hydratedSignatures: ['svart hettegenser|mens'],
      }),
    ).toBe(false);
  });

  it('blocks re-hydration when the restored thread already contains the query', () => {
    expect(
      shouldHydrateUrlQuery({
        query: 'Svart hettegenser',
        shopCategory: 'mens',
        messages: [
          { id: '1', role: 'user', content: 'Svart hettegenser' },
          { id: '2', role: 'assistant', content: 'Her er noen forslag.' },
        ],
        hydratedSignatures: [],
      }),
    ).toBe(false);
  });

  it('allows a different query signature after follow-up turns', () => {
    expect(
      shouldHydrateUrlQuery({
        query: 'Regnjakke',
        shopCategory: 'mens',
        messages: [
          { id: '1', role: 'user', content: 'Svart hettegenser' },
          { id: '2', role: 'assistant', content: 'Svar' },
        ],
        hydratedSignatures: ['svart hettegenser|mens'],
      }),
    ).toBe(true);
  });
});

describe('restorePersistedChatThread', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('drops an incomplete pending turn restored after refresh', () => {
    sessionStorage.setItem(
      CHAT_THREAD_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        messages: [
          { id: '1', role: 'user', content: 'Hei' },
          { id: '2', role: 'assistant', content: 'Hei!', status: 'complete' },
          { id: '3', role: 'user', content: 'Regnjakke' },
          { id: '4', role: 'assistant', content: '', status: 'pending' },
        ],
        activeProductId: null,
      }),
    );

    expect(restorePersistedChatThread()?.messages).toEqual([
      { id: '1', role: 'user', content: 'Hei' },
      { id: '2', role: 'assistant', content: 'Hei!', status: 'complete' },
    ]);
  });
});
