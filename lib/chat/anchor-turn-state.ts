import type { ChatTurnContext } from '@/lib/api/chat-types';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import {
  clearAnchorTurnContext,
  saveAnchorTurnContext,
} from '@/lib/chat/anchor-actions';

export function shouldClearActiveProductId(
  context?: ChatTurnContext,
): boolean {
  return !context?.productId;
}

export function syncAnchorSessionForTurn(
  context: ChatTurnContext | undefined,
  message: string,
  options?: { persistAnchor?: boolean; anchorPreview?: AnchorPreview },
): void {
  if (context?.productId && options?.persistAnchor !== false) {
    const preview = options?.anchorPreview;
    saveAnchorTurnContext(
      context.productId,
      message,
      preview
        ? {
            name: preview.name,
            image: preview.image,
            brand: preview.brand,
          }
        : undefined,
    );
    return;
  }

  if (!context?.productId) {
    clearAnchorTurnContext();
  }
}
