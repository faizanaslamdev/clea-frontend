import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { ShopCategory } from '@/lib/api/chat-types';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import { savePendingBootstrapEntry } from '@/lib/chat/chat-bootstrap-entry';
import { parseShopCategory } from '@/lib/chat/shop-category';

export interface ChatEntryNavigation {
  query: string;
  productId?: string;
  anchorPreview?: Omit<AnchorPreview, 'productId'>;
}

/** Parsed bootstrap state from `/chat` search params (legacy `category` supported). */
export interface ChatEntryBootstrap {
  query: string;
  entryId?: string;
  /** Present only when a legacy/shareable URL included `category=mens|womens`. */
  legacyShopCategory?: ShopCategory;
}

/**
 * Build a shareable Chat entry URL for new navigations.
 * New links intentionally omit `category=` — shop context must not be inferred
 * from landing presentation; legacy incoming URLs remain supported separately.
 */
export function buildChatEntryUrl(
  input: ChatEntryNavigation & { entryId: string },
): string {
  const trimmed = input.query.trim();
  if (!trimmed) {
    return '/chat';
  }

  const params = new URLSearchParams({
    q: trimmed,
    entry: input.entryId,
  });
  return `/chat?${params.toString()}`;
}

export function buildLegacyChatEntryUrl(input: {
  query: string;
  entryId: string;
  legacyShopCategory?: ShopCategory;
}): string {
  const trimmed = input.query.trim();
  if (!trimmed) {
    return '/chat';
  }

  const params = new URLSearchParams({
    q: trimmed,
    entry: input.entryId,
  });

  if (input.legacyShopCategory) {
    params.set('category', input.legacyShopCategory);
  }

  return `/chat?${params.toString()}`;
}

export function navigateToChatEntry(
  router: AppRouterInstance,
  input: ChatEntryNavigation,
): void {
  const trimmed = input.query.trim();
  if (!trimmed) {
    router.push('/chat');
    return;
  }

  const entryId = crypto.randomUUID();
  const clientTurnId = crypto.randomUUID();

  savePendingBootstrapEntry({
    entryId,
    query: trimmed,
    productId: input.productId,
    anchorPreview: input.anchorPreview,
    clientTurnId,
  });

  router.push(
    buildChatEntryUrl({
      query: trimmed,
      entryId,
      productId: input.productId,
      anchorPreview: input.anchorPreview,
    }),
  );
}

/** Read entry bootstrap from the current `/chat` location (not used on `/chat/{id}`). */
export function parseChatEntryBootstrap(
  params: Pick<URLSearchParams, 'get'>,
): ChatEntryBootstrap {
  const query = params.get('q')?.trim() ?? '';
  const entryId = params.get('entry')?.trim() || undefined;
  const legacyShopCategory = parseShopCategory(params.get('category'));

  return {
    query,
    entryId,
    legacyShopCategory,
  };
}
