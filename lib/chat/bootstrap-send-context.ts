import type { ChatTurnContext, ShopCategory } from '@/lib/api/chat-types';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import type { BootstrapPendingEntry } from '@/lib/chat/chat-bootstrap-entry';
import { resolveBootstrapShopCategory } from '@/lib/chat/chat-bootstrap-entry';

/** Merge homepage shop tab into turn context the same way useChatSession.requestTurn does. */
export function mergeShopCategoryIntoTurnContext(
  shopCategory: ShopCategory | undefined,
  context?: ChatTurnContext,
): ChatTurnContext | undefined {
  if (!shopCategory) {
    return context;
  }

  return { ...context, shopCategory };
}

/** Build first-turn context after bootstrap claim (before requestTurn merge). */
export function buildBootstrapHydrationContext(input: {
  shopCategory?: ShopCategory;
  anchorPreview?: AnchorPreview;
}): ChatTurnContext | undefined {
  if (input.anchorPreview) {
    return { productId: input.anchorPreview.productId };
  }

  if (input.shopCategory) {
    return { shopCategory: input.shopCategory };
  }

  return undefined;
}

/** End-to-end bootstrap → session shop context for the first turn. */
export function resolveHomepageBootstrapSession(input: {
  entry: Pick<BootstrapPendingEntry, 'shopCategory' | 'legacyShopCategory'>;
  urlLegacyShopCategory?: ShopCategory;
  anchorPreview?: AnchorPreview;
}): {
  shopCategory?: ShopCategory;
  createConversationShopCategory?: ShopCategory;
  firstTurnContext?: ChatTurnContext;
  firstTurnRequestContext?: ChatTurnContext;
} {
  const shopCategory = resolveBootstrapShopCategory(
    input.entry,
    input.urlLegacyShopCategory,
  );

  const hydrationContext = buildBootstrapHydrationContext({
    shopCategory,
    anchorPreview: input.anchorPreview,
  });

  return {
    shopCategory,
    createConversationShopCategory: shopCategory,
    firstTurnContext: hydrationContext,
    firstTurnRequestContext: mergeShopCategoryIntoTurnContext(
      shopCategory,
      hydrationContext,
    ),
  };
}
