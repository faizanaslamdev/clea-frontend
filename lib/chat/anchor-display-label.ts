import {
  ANCHOR_CHEAPER_MESSAGE,
  ANCHOR_SIMILAR_MESSAGE,
} from '@/lib/chat/anchor-actions';

const META_PRODUCT_QUERY_PATTERN =
  /\b(?:more\s+details?|tell\s+me\s+more|about\s+this(?:\s+(?:item|product|one))?|this\s+(?:item|product|one)|mer\s+om\s+det(?:te|te)?(?:\s+produktet)?|flere\s+detaljer|om\s+denne|om\s+dette\s+produktet|hva\s+er\s+dette|fortell\s+meg\s+mer|mer\s+info(?:\s+om\s+det(?:te)?)?)\b/i;

export function anchorDisplayLabel(actionLabel: string): string {
  if (actionLabel === ANCHOR_SIMILAR_MESSAGE) {
    return 'Vis lignende';
  }

  if (actionLabel === ANCHOR_CHEAPER_MESSAGE) {
    return 'Finn billigere';
  }

  if (META_PRODUCT_QUERY_PATTERN.test(actionLabel.trim())) {
    return 'Om dette produktet';
  }

  const trimmed = actionLabel.trim();
  if (trimmed.length > 32) {
    return `${trimmed.slice(0, 29)}…`;
  }

  return trimmed;
}
