import { afterEach, describe, expect, it } from 'vitest';
import {
  CHAT_SHOP_CATEGORY_STORAGE_KEY,
  clearChatThreadPersistence,
} from '@/lib/chat/chat-thread-persistence';

describe('legacy shop category sessionStorage lifecycle', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('clears stale clea-chat-shop-category-v1 on chat reset persistence clear', () => {
    sessionStorage.setItem(CHAT_SHOP_CATEGORY_STORAGE_KEY, JSON.stringify('mens'));

    clearChatThreadPersistence();

    expect(sessionStorage.getItem(CHAT_SHOP_CATEGORY_STORAGE_KEY)).toBeNull();
  });

  it('does not read stale shop category when starting a generic query-only entry', () => {
    sessionStorage.setItem(CHAT_SHOP_CATEGORY_STORAGE_KEY, JSON.stringify('mens'));

    // Shop context travels via bootstrap entry shopCategory, not sessionStorage.
    expect(sessionStorage.getItem(CHAT_SHOP_CATEGORY_STORAGE_KEY)).toBe(
      JSON.stringify('mens'),
    );
    clearChatThreadPersistence();
    expect(sessionStorage.getItem(CHAT_SHOP_CATEGORY_STORAGE_KEY)).toBeNull();
  });
});
