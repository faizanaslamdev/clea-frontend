import type { ChatTurnContext } from '@/lib/api/chat-types';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';
import { isAnchorActionMessage } from '@/lib/chat/anchor-preview';
import { isAnchorDependentSuggestion } from '@/lib/chat/anchor-actions';
import { isAnchorDependentComposerMessage } from '@/lib/chat/anchor-dependent-message';

export type SendMessageSource =
  | 'composer'
  | 'suggestion'
  | 'product-card'
  | 'anchor-action';

export interface ResolveSendMessageInput {
  query: string;
  source: SendMessageSource;
  explicitContext?: ChatTurnContext;
  activeProductId: string | null;
  anchorPreview?: AnchorPreview;
  /** Anchor product on the assistant message that rendered the suggestion chips. */
  suggestionSourceAnchorProductId?: string;
}

export interface ResolvedSendMessage {
  context?: ChatTurnContext;
  /** Only set when the thread should render the mini image + pill. */
  anchorPreview?: AnchorPreview;
  showAsProductReference: boolean;
  clearActiveProduct: boolean;
}

export function resolveSendMessage(
  input: ResolveSendMessageInput,
): ResolvedSendMessage {
  const trimmed = input.query.trim();
  const isAnchorAction = isAnchorActionMessage(trimmed);

  if (input.source === 'product-card') {
    const productId = input.explicitContext?.productId;
    return {
      context: productId ? { productId } : input.explicitContext,
      anchorPreview: input.anchorPreview,
      showAsProductReference: true,
      clearActiveProduct: false,
    };
  }

  if (input.source === 'anchor-action') {
    const productId = input.explicitContext?.productId;
    return {
      context: productId ? { productId } : undefined,
      anchorPreview: input.anchorPreview,
      showAsProductReference: true,
      clearActiveProduct: false,
    };
  }

  if (input.source === 'suggestion') {
    if (isAnchorDependentSuggestion(trimmed)) {
      const productId =
        input.activeProductId ?? input.suggestionSourceAnchorProductId;

      return {
        context: productId ? { productId } : undefined,
        anchorPreview: undefined,
        showAsProductReference: false,
        clearActiveProduct: false,
      };
    }

    return {
      context: undefined,
      anchorPreview: undefined,
      showAsProductReference: false,
      clearActiveProduct: true,
    };
  }

  let context = input.explicitContext;

  if (
    !context?.productId &&
    input.activeProductId &&
    isAnchorDependentComposerMessage(trimmed)
  ) {
    context = { productId: input.activeProductId };
  }

  const keepsProductContext = Boolean(context?.productId) || isAnchorAction;

  return {
    context,
    anchorPreview: undefined,
    showAsProductReference: false,
    clearActiveProduct: !keepsProductContext,
  };
}
