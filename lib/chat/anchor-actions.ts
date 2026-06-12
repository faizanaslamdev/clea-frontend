import type { AnchorPreview } from '@/lib/chat/anchor-preview';

export const ANCHOR_SIMILAR_MESSAGE = 'Vis lignende produkter';
export const ANCHOR_CHEAPER_MESSAGE = 'Finn billigere alternativer';

export type ChatAnchorKind = 'similar' | 'cheaper';

const ANCHOR_DEPENDENT_CHIP_PATTERN =
  /\b(billigere|lignende|similar|cheaper|material|materiale|passform|fit|annen\s+farge|different\s+colour)\b/i;

export function anchorMessageForKind(kind: ChatAnchorKind): string {
  return kind === 'similar' ? ANCHOR_SIMILAR_MESSAGE : ANCHOR_CHEAPER_MESSAGE;
}

export function isAnchorDependentSuggestion(label: string): boolean {
  return ANCHOR_DEPENDENT_CHIP_PATTERN.test(label);
}

export function filterSuggestionsForAnchor(
  suggestions: readonly string[] | undefined,
  anchorProductId: string | undefined,
): string[] | undefined {
  if (!suggestions?.length) {
    return undefined;
  }

  const filtered = anchorProductId
    ? [...suggestions]
    : suggestions.filter((label) => !isAnchorDependentSuggestion(label));

  return filtered.length > 0 ? filtered : undefined;
}

export function resolveAnchorProductId(options: {
  activeProductId?: string | null;
  messageAnchorProductId?: string;
}): string | undefined {
  return options.activeProductId ?? options.messageAnchorProductId ?? undefined;
}

const ANCHOR_SESSION_KEY = 'clea-chat-anchor';

interface AnchorTurnSession {
  productId: string;
  message: string;
  preview?: Omit<AnchorPreview, 'productId'>;
}

function readAnchorTurnSession(): AnchorTurnSession | undefined {
  if (typeof window === 'undefined') return undefined;

  const raw = sessionStorage.getItem(ANCHOR_SESSION_KEY);
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(raw) as AnchorTurnSession;
    if (parsed.productId && parsed.message) {
      return parsed;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function saveAnchorTurnContext(
  productId: string,
  message: string,
  preview?: Omit<AnchorPreview, 'productId'>,
): void {
  if (typeof window === 'undefined') return;

  const payload: AnchorTurnSession = {
    productId,
    message: message.trim(),
    ...(preview ? { preview } : {}),
  };

  sessionStorage.setItem(ANCHOR_SESSION_KEY, JSON.stringify(payload));
}

export function loadAnchorTurnContext(message: string): AnchorPreview | undefined {
  const session = readAnchorTurnSession();
  if (!session || session.message !== message.trim()) {
    return undefined;
  }

  return {
    productId: session.productId,
    name: session.preview?.name ?? 'Produkt',
    image: session.preview?.image ?? '',
    brand: session.preview?.brand,
  };
}

export function reconcileAnchorSessionForMessage(
  message: string,
): AnchorPreview | undefined {
  const session = readAnchorTurnSession();
  if (!session) {
    return undefined;
  }

  if (session.message !== message.trim()) {
    clearAnchorTurnContext();
    return undefined;
  }

  return {
    productId: session.productId,
    name: session.preview?.name ?? 'Produkt',
    image: session.preview?.image ?? '',
    brand: session.preview?.brand,
  };
}

export function clearAnchorTurnContext(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ANCHOR_SESSION_KEY);
}

export function isAnchorIntent(intent?: string): boolean {
  return intent === 'similar_products' || intent === 'cheaper_alternatives';
}
