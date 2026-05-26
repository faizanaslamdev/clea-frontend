/** Demo-only copy shown under each user message in chat. */
export function buildUserSearchDemoSummary(query: string): {
  status: string;
  tags: string[];
} {
  const tags = ['Lowest price', 'Nordic retailers'];
  const lower = query.toLowerCase();

  if (/(jean|denim|trouser|pant|wide.?leg)/.test(lower)) tags.push('Denim');
  if (/(shoe|sneaker|boot|footwear|sandal)/.test(lower)) tags.push('Footwear');
  if (/(bag|tote|briefcase|leather)/.test(lower)) tags.push('Bags');
  if (/(dress|gown|skirt)/.test(lower)) tags.push('Dresses');
  if (/(jacket|coat|blazer|outerwear)/.test(lower)) tags.push('Outerwear');
  if (/(track|sport|run)/.test(lower)) tags.push('Activewear');

  return {
    status: 'Scanning Nordic stores for your match',
    tags: [...new Set(tags)].slice(0, 4),
  };
}
