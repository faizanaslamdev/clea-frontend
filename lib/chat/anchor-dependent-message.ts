import type { ChatTurnContext } from '@/lib/api/chat-types';

const CHEAPER_COMPOSER_PATTERN =
  /\b(cheaper(?:\s+alternative)?|less expensive|something cheaper|similar but cheaper|billigere(?:\s+alternativ)?|noe billigere|lignende men billigere)\b/i;

const META_PRODUCT_COMPOSER_PATTERN =
  /\b(more\s+details?|tell\s+me\s+more|about\s+this(?:\s+(?:item|product|one))?|this\s+(?:item|product|one)|mer\s+om\s+det(?:te|te)?(?:\s+produktet)?|flere\s+detaljer|om\s+denne|om\s+dette\s+produktet|hva\s+er\s+dette|fortell\s+meg\s+mer|mer\s+info(?:\s+om\s+det(?:te)?)?)\b/i;

const SIMILAR_COMPOSER_PATTERN =
  /\b(similar(?:\s+to\s+this)?|something similar|like this|lignende(?:\s+dette|\s+produkter)?|noe lignende|similar products)\b/i;

const COLOR_VARIANT_COMPOSER_PATTERN =
  /\b(?:same\s+in|samme\s+i|in\s+(?:\w+\s+)?colou?r|i\s+(?:\w+\s+)?farge|annen\s+farge|different\s+colou?r)\b/i;

export function isAnchorDependentComposerMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) {
    return false;
  }

  return (
    CHEAPER_COMPOSER_PATTERN.test(trimmed) ||
    SIMILAR_COMPOSER_PATTERN.test(trimmed) ||
    META_PRODUCT_COMPOSER_PATTERN.test(trimmed) ||
    COLOR_VARIANT_COMPOSER_PATTERN.test(trimmed)
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
