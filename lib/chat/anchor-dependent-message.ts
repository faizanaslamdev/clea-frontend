import type { ChatTurnContext } from '@/lib/api/chat-types';

const CHEAPER_COMPOSER_PATTERN =
  /\b(cheaper|less expensive|something cheaper|similar but cheaper|billigere|noe billigere|lignende men billigere)\b/i;

const SIMILAR_COMPOSER_PATTERN =
  /\b(similar|something similar|like this|lignende|noe lignende|similar products)\b/i;

export function isAnchorDependentComposerMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) {
    return false;
  }

  return (
    CHEAPER_COMPOSER_PATTERN.test(trimmed) ||
    SIMILAR_COMPOSER_PATTERN.test(trimmed)
  );
}

export function resolveComposerTurnContext(
  message: string,
  context: ChatTurnContext | undefined,
  activeProductId: string | null | undefined,
): ChatTurnContext | undefined {
  if (context?.productId) {
    return context;
  }

  if (activeProductId && isAnchorDependentComposerMessage(message)) {
    return { productId: activeProductId };
  }

  return context;
}
