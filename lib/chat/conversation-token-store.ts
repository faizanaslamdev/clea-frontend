const TOKEN_STORE_KEY = 'clea-chat-conv-tokens-v1';

interface TokenStore {
  version: 1;
  tokens: Record<string, string>;
}

function readStore(): TokenStore {
  if (typeof window === 'undefined') {
    return { version: 1, tokens: {} };
  }

  try {
    const raw = window.sessionStorage.getItem(TOKEN_STORE_KEY);
    if (!raw) {
      return { version: 1, tokens: {} };
    }
    const parsed = JSON.parse(raw) as TokenStore;
    if (parsed.version !== 1 || typeof parsed.tokens !== 'object') {
      return { version: 1, tokens: {} };
    }
    return parsed;
  } catch {
    return { version: 1, tokens: {} };
  }
}

function writeStore(store: TokenStore): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(TOKEN_STORE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota failures — caller must handle missing token on restore.
  }
}

export function saveAnonymousToken(
  conversationId: string,
  anonymousToken: string,
): void {
  const store = readStore();
  store.tokens[conversationId] = anonymousToken;
  writeStore(store);
}

export function getAnonymousToken(conversationId: string): string | null {
  return readStore().tokens[conversationId] ?? null;
}

export function removeAnonymousToken(conversationId: string): void {
  const store = readStore();
  delete store.tokens[conversationId];
  writeStore(store);
}

export function clearAnonymousTokens(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.sessionStorage.removeItem(TOKEN_STORE_KEY);
}

/** @internal Test helper */
export function __readTokenStoreForTests(): TokenStore {
  return readStore();
}
