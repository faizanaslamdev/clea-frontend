import type { ChatTurnContext } from '@/lib/api/chat-types';

const CHEAPER_COMPOSER_PATTERN =
  /(?<![\p{L}])(cheaper(?:\s+alternatives?)?|cheapest|less expensive|something cheaper|similar but cheaper|billigere(?:\s+alternativ\p{L}*)?|noe billigere|lignende men billigere|rimeligere|billigste(?:\s+variant)?)(?![\p{L}])/iu;

const META_PRODUCT_COMPOSER_PATTERN =
  /\b(more\s+details?|tell\s+me\s+more|about\s+this(?:\s+(?:item|product|one))?|this\s+(?:item|product|one)|mer\s+om\s+det(?:te|te)?(?:\s+produktet)?|flere\s+detaljer|om\s+denne|om\s+dette\s+produktet|hva\s+er\s+dette|fortell\s+meg\s+mer|mer\s+info(?:\s+om\s+det(?:te)?)?)\b/i;

const SIMILAR_COMPOSER_PATTERN =
  /(?<![\p{L}])(similar(?:\s+to\s+this|\s+ones)?|something similar|more like this|like this|lignende(?:\s+dette|\s+produkter)?|liknende(?:\s+dette|\s+produkter)?|tilsvarende|noe lignende|similar products)(?![\p{L}])/iu;

const COLOUR_WORD =
  '(?:svart\\p{L}*|sort\\p{L}*|hvit\\p{L}*|blå\\p{L}*|rød\\p{L}*|grønn?\\p{L}*|grå\\p{L}*|brun\\p{L}*|beige|rosa|gul\\p{L}*|oransje|lilla|navy|black|white|blue|red|green|gr[ae]y|brown|pink|yellow|orange|purple)';

/** "Har du denne i svart?", "Do you have it in black?", "this in white". */
const THIS_IN_COLOUR_PATTERN = new RegExp(
  `(?<![\\p{L}])(?:denne|den|dette|det|disse|it|this|these|one)(?![\\p{L}]).*(?<![\\p{L}])${COLOUR_WORD}(?![\\p{L}])`,
  'iu',
);

const COLOR_VARIANT_COMPOSER_PATTERN =
  /\b(?:same\s+in|samme\s+i|in\s+(?:\w+\s+)?colou?r|i\s+(?:\w+\s+)?farge|annen\s+farge|andre\s+farger|(?:different|other|another)\s+colou?rs?)\b/i;

export function isAnchorDependentComposerMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) {
    return false;
  }

  return (
    CHEAPER_COMPOSER_PATTERN.test(trimmed) ||
    SIMILAR_COMPOSER_PATTERN.test(trimmed) ||
    META_PRODUCT_COMPOSER_PATTERN.test(trimmed) ||
    COLOR_VARIANT_COMPOSER_PATTERN.test(trimmed) ||
    THIS_IN_COLOUR_PATTERN.test(trimmed)
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
