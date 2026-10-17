import type { ShopCategory } from '@/lib/api/chat-types';

/**
 * Words that make a request a conversation (advice, an occasion, a style,
 * "something like this") rather than a product lookup. Those go to the AI
 * chat; everything else opens the search results page.
 */
const CONVERSATIONAL_WORDS = new Set(
  (
    'hva hvilke hvilken hvordan hvor kan bør burde anbefal anbefale anbefaling forslag foreslå hjelp ' +
    'trenger passer passe funker matche matcher kombinere kombinert style styling stil look antrekk ' +
    'outfit gave gaver bryllup bryllupsgjest fest selskap jobb jobben kontor kontoret kontordagen ' +
    'middag date ferie ferien reise anledning konfirmasjon julebord lignende ligner inspirasjon ' +
    'what which how should recommend suggest suggestion help need outfit style wedding party ' +
    'occasion gift similar like vacation interview'
  ).split(' '),
);

/** Purpose/description glue: "kjole til bryllup", "jakke som tåler regn". */
const CONVERSATIONAL_GLUE = new Set(['til', 'som', 'for', 'med', 'uten', 'to', 'that', 'with', 'without']);

const AUDIENCE_AFTER_GLUE = /^(herre|herrer|dame|damer|menn|kvinner|barn|men|women|kids|gutter|jenter)$/;

const MAX_SEARCH_WORDS = 6;

/** Words, ignoring prices/sizes ("under 1 000 kr" is still a lookup). */
function meaningfulWords(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'&\s-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w && !/^\d+$/.test(w) && w !== 'kr' && w !== 'nok');
}

/**
 * Search box routing: product lookups ("svarte herre jeans under 800",
 * "levis 501", "ryggsekk") go to the results page; questions, occasions and
 * styling requests go to the AI chat, which can ask back and explain.
 */
export function shouldOpenChat(query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return false;
  if (trimmed.includes('?')) return true;
  const words = meaningfulWords(trimmed);
  if (words.length > MAX_SEARCH_WORDS) return true;
  if (words.some((w) => CONVERSATIONAL_WORDS.has(w))) return true;
  // "til/som/for" + more words describes a need, not a product name —
  // except "for menn" / "til herre", which name an audience.
  return words.some(
    (w, i) => i > 0 && i < words.length - 1 && CONVERSATIONAL_GLUE.has(w) && !AUDIENCE_AFTER_GLUE.test(words[i + 1]),
  );
}

export const SEARCH_PATH = '/sok';
export const SEARCH_QUERY_PARAM = 'q';
/** Dame/Herre toggle carried as a soft hint (`for=herre`). */
export const SEARCH_AUDIENCE_PARAM = 'for';

export function buildSearchUrl(query: string, shopCategory?: ShopCategory): string {
  const params = new URLSearchParams({ [SEARCH_QUERY_PARAM]: query.trim() });
  if (shopCategory) params.set(SEARCH_AUDIENCE_PARAM, shopCategory === 'mens' ? 'herre' : 'dame');
  return `${SEARCH_PATH}?${params.toString()}`;
}
