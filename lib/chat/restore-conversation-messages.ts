import { mapChatProductCardToProduct } from '@/lib/api/chat-mappers';
import type { RestoreConversationResponse } from '@/lib/api/chat-types';
import { anchorPreviewFromProductReference } from '@/lib/chat/anchor-preview';
import type { SearchChatMessageData } from '@/lib/chat/chat-messages';

export function mapRestoreConversationToMessages(
  restored: RestoreConversationResponse,
): SearchChatMessageData[] {
  const messages: SearchChatMessageData[] = [];

  for (const turn of restored.turns) {
    if (turn.role === 'user') {
      const anchorPreview = turn.productReference
        ? anchorPreviewFromProductReference(turn.productReference)
        : undefined;
      messages.push({
        id: turn.clientTurnId ?? `user-${turn.seq}`,
        role: 'user',
        content: turn.message,
        turnId: turn.clientTurnId,
        anchorProductId: anchorPreview?.productId,
        anchorPreview,
      });
      continue;
    }

    const products = (turn.products ?? []).map(mapChatProductCardToProduct);
    messages.push({
      id: `assistant-${turn.seq}`,
      role: 'assistant',
      content: turn.reply ?? turn.message,
      turnId: messages[messages.length - 1]?.turnId,
      status: 'complete',
      products: products.length > 0 ? products : undefined,
      query: restored.turns.find((candidate) => candidate.seq === turn.seq - 1)
        ?.message,
      searchTotal: turn.total,
      searchHasMore: turn.hasMore,
      searchLimit: turn.limit,
      catalogQuery: turn.catalogQuery,
      intent: turn.intent,
      anchorProductId: turn.anchorProductId,
      suggestions: turn.suggestions,
      degraded: turn.degraded,
    });
  }

  return messages;
}

/** Prefer conversation-level anchor, else last user/assistant product ref. */
export function resolveRestoredActiveProductId(
  restored: RestoreConversationResponse,
): string | null {
  if (restored.anchorProductId) {
    return restored.anchorProductId;
  }

  for (let index = restored.turns.length - 1; index >= 0; index -= 1) {
    const turn = restored.turns[index];
    if (turn.role === 'user' && turn.productReference?.productId) {
      return turn.productReference.productId;
    }
    if (turn.role === 'assistant' && turn.anchorProductId) {
      return turn.anchorProductId;
    }
  }

  return null;
}
