export function shouldHideChatFooter(input: {
  messageCount: number;
  urlQuery: string;
  conversationId?: string;
  isRestoring: boolean;
}): boolean {
  return (
    input.messageCount > 0 ||
    Boolean(input.urlQuery.trim()) ||
    Boolean(input.conversationId) ||
    input.isRestoring
  );
}

export function shouldSkipConversationRestore(input: {
  conversationId: string;
  sessionConversationId?: string;
  messageCount: number;
  hasActiveTurn: boolean;
}): boolean {
  return (
    input.sessionConversationId === input.conversationId &&
    (input.messageCount > 0 || input.hasActiveTurn)
  );
}

export function conversationIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/chat\/([^/]+)$/);
  return match?.[1];
}
