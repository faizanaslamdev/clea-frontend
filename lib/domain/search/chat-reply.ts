export function buildSearchAssistantReply(
  query: string,
  resultCount: number,
): string {
  const trimmed = query.trim();
  if (!trimmed) {
    return 'Tell me what you are shopping for and I will surface matching products.';
  }
  if (resultCount === 0) {
    return `I could not find a match for "${trimmed}". Try refining your search.`;
  }
  return `Here are some options for "${trimmed}".`;
}
