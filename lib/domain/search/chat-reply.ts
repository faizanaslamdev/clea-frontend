export function buildSearchAssistantReply(
  query: string,
  resultCount: number,
  options?: { usedFallback?: boolean },
): string {
  const trimmed = query.trim();
  if (!trimmed) {
    return 'Fortell meg hva du leter etter, så viser jeg matchende produkter.';
  }
  if (resultCount === 0) {
    return `Jeg fant ingen treff på «${trimmed}». Prøv å presisere søket.`;
  }
  if (options?.usedFallback) {
    return `Jeg fant ingen eksakt match på «${trimmed}». Her er noen forslag du kan like.`;
  }
  return `Her er noen alternativer for «${trimmed}».`;
}
