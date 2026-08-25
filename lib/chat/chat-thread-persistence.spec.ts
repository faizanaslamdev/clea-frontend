import { afterEach, describe, expect, it } from 'vitest';
import {
  CHAT_THREAD_STORAGE_KEY,
  restorePersistedChatThread,
  threadContainsUserQuery,
} from '@/lib/chat/chat-thread-persistence';

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
