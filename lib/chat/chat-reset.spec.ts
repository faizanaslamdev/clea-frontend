import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearAnchorTurnContext, saveAnchorTurnContext } from '@/lib/chat/anchor-actions';
import { performChatReset } from '@/lib/chat/chat-reset';

describe('performChatReset', () => {
  afterEach(() => {
    clearAnchorTurnContext();
    vi.restoreAllMocks();
  });

  it('clears anchor session and returns a new session id', () => {
    saveAnchorTurnContext('product-1', 'Vis lignende produkter', {
      name: 'Nike Air Force 1',
      image: '/nike.jpg',
    });

    const resetSessionId = vi.fn(() => 'sess_new123');
    const clearAnchor = vi.fn(clearAnchorTurnContext);

    const result = performChatReset({ resetSessionId, clearAnchor });

    expect(clearAnchor).toHaveBeenCalledOnce();
    expect(resetSessionId).toHaveBeenCalledOnce();
    expect(result.sessionId).toBe('sess_new123');
    expect(sessionStorage.getItem('clea-chat-anchor')).toBeNull();
  });
});
