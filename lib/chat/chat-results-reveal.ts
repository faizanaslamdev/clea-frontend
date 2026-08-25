import {
  isPendingAssistantMessage,
  type SearchChatMessageData,
} from '@/lib/chat/chat-messages';

export const CHAT_RESULTS_INTRINSIC_REVEAL_CLASS =
  'search-chat-thread__results-reveal';

export interface IntrinsicResultsRevealTarget {
  messageId: string;
  collapsed: boolean;
}

export function findPendingAssistantMessageId(
  messages: readonly SearchChatMessageData[],
): string | null {
  return messages.find(isPendingAssistantMessage)?.id ?? null;
}

export function shouldUseIntrinsicResultsReveal(
  messageId: string,
  revealTarget: IntrinsicResultsRevealTarget | null,
): boolean {
  return revealTarget?.messageId === messageId;
}

export function trackFreshResultsReveal(
  messages: readonly SearchChatMessageData[],
  previousPendingAssistantMessageId: string | null,
  activeRevealMessageId: string | null = null,
): {
  nextPendingAssistantMessageId: string | null;
  newlyRevealedMessageId: string | null;
} {
  const nextPendingAssistantMessageId = findPendingAssistantMessageId(messages);
  let newlyRevealedMessageId: string | null = null;

  if (
    previousPendingAssistantMessageId &&
    previousPendingAssistantMessageId !== activeRevealMessageId
  ) {
    const completed = messages.find(
      (message) => message.id === previousPendingAssistantMessageId,
    );

    if (
      completed?.role === 'assistant' &&
      !isPendingAssistantMessage(completed) &&
      (completed.products?.length ?? 0) > 0
    ) {
      newlyRevealedMessageId = previousPendingAssistantMessageId;
    }
  }

  return {
    nextPendingAssistantMessageId,
    newlyRevealedMessageId,
  };
}

export function prefersReducedResultsMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function clearRevealOnTransitionEnd(
  revealTarget: IntrinsicResultsRevealTarget | null,
  messageId: string,
  propertyName: string,
): IntrinsicResultsRevealTarget | null {
  if (propertyName !== 'grid-template-rows') {
    return revealTarget;
  }

  if (
    revealTarget?.messageId === messageId &&
    revealTarget.collapsed === false
  ) {
    return null;
  }

  return revealTarget;
}
