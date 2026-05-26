export function buildSearchAssistantReply(
  query: string,
  resultCount: number,
  options?: { usedFallback?: boolean },
): string {
  const trimmed = query.trim();
  if (!trimmed) {
    return 'Tell me what you are shopping for and I will surface matching products.';
  }
  if (resultCount === 0) {
    return `I could not find a match for "${trimmed}". Try refining your search.`;
  }
  if (options?.usedFallback) {
    return `I couldn't find an exact match for "${trimmed}". Here are some picks you might like.`;
  }
  return `Here are some options for "${trimmed}".`;
}
