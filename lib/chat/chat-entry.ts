import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { ShopCategory } from '@/lib/api/chat-types';
import { parseShopCategory } from '@/lib/chat/shop-category';

export interface ChatEntryNavigation {
  query: string;
}

/** Parsed bootstrap state from `/chat` search params (legacy `category` supported). */
export interface ChatEntryBootstrap {
  query: string;
  /** Present only when a legacy/shareable URL included `category=mens|womens`. */
  legacyShopCategory?: ShopCategory;
}

/**
 * Build a shareable Chat entry URL for new navigations.
 * New links intentionally omit `category=` — shop context must not be inferred
 * from landing presentation; legacy incoming URLs remain supported separately.
 */
export function buildChatEntryUrl(input: ChatEntryNavigation): string {
  const trimmed = input.query.trim();
  if (!trimmed) {
    return '/chat';
  }

  const params = new URLSearchParams({ q: trimmed });
  return `/chat?${params.toString()}`;
}

export function navigateToChatEntry(
  router: AppRouterInstance,
  input: ChatEntryNavigation,
): void {
  router.push(buildChatEntryUrl(input));
}

/** Read entry bootstrap from the current `/chat` location (not used on `/chat/{id}`). */
export function parseChatEntryBootstrap(
  params: Pick<URLSearchParams, 'get'>,
): ChatEntryBootstrap {
  const query = params.get('q')?.trim() ?? '';
  const legacyShopCategory = parseShopCategory(params.get('category'));

  return {
    query,
    legacyShopCategory,
  };
}
