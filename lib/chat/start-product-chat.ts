import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import {
  anchorMessageForKind,
  saveAnchorTurnContext,
  type ChatAnchorKind,
} from '@/lib/chat/anchor-actions';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import { isAnchorActionMessage } from '@/lib/chat/anchor-preview';
import type { SendMessageSource } from '@/lib/chat/resolve-send-message';

export function resolveHydratedSendSource(
  query: string,
  anchorPreview?: AnchorPreview,
): SendMessageSource {
  if (!anchorPreview) {
    return 'composer';
  }

  return isAnchorActionMessage(query) ? 'anchor-action' : 'product-card';
}

export function startProductChatFromAnchor(
  router: AppRouterInstance,
  options: {
    productId: string;
    query: string;
    preview?: AnchorPreview;
    onComplete?: () => void;
  },
): void {
  saveAnchorTurnContext(
    options.productId,
    options.query,
    options.preview
      ? {
          name: options.preview.name,
          image: options.preview.image,
          brand: options.preview.brand,
        }
      : undefined,
  );

  const params = new URLSearchParams({ q: options.query });
  router.push(`/chat?${params.toString()}`);
  options.onComplete?.();
}

export function startProductChatAnchorAction(
  router: AppRouterInstance,
  productId: string,
  kind: ChatAnchorKind,
  preview?: AnchorPreview,
  onComplete?: () => void,
): void {
  startProductChatFromAnchor(router, {
    productId,
    query: anchorMessageForKind(kind),
    preview,
    onComplete,
  });
}
