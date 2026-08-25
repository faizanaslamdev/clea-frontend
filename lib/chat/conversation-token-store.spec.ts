import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearAnonymousTokens,
  getAnonymousToken,
  saveAnonymousToken,
} from '@/lib/chat/conversation-token-store';

describe('conversation-token-store', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('stores and retrieves anonymous tokens by conversationId', () => {
    saveAnonymousToken('conv-a', 'token-a');
    saveAnonymousToken('conv-b', 'token-b');

    expect(getAnonymousToken('conv-a')).toBe('token-a');
    expect(getAnonymousToken('conv-b')).toBe('token-b');
    expect(getAnonymousToken('missing')).toBeNull();
  });

  it('clears all stored tokens', () => {
    saveAnonymousToken('conv-a', 'token-a');
    clearAnonymousTokens();
    expect(getAnonymousToken('conv-a')).toBeNull();
  });
});
