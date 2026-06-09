import { ApiError } from '@/lib/api/backend-client';
import { CHAT_SEARCH_ERROR_MESSAGE } from '@/lib/constants/chat';

const CHAT_ERROR_MESSAGES_NB: Record<string, string> = {
  rate_limit_exceeded:
    'Du sender for mange forespørsler. Vent litt og prøv igjen.',
  llm_unavailable:
    'Søketjenesten er midlertidig utilgjengelig. Prøv igjen om litt.',
  llm_timeout:
    'Søket tok for lang tid. Prøv igjen med en enklere forespørsel.',
  message_required: 'Skriv en melding før du sender.',
  message_too_long: 'Meldingen er for lang. Kort den ned og prøv igjen.',
  invalid_product_id: 'Produktet finnes ikke lenger.',
  invalid_offset: 'Kunne ikke laste flere resultater. Prøv et nytt søk.',
};

export function resolveChatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code && CHAT_ERROR_MESSAGES_NB[error.code]) {
      return CHAT_ERROR_MESSAGES_NB[error.code];
    }

    if (error.status === 429) {
      return CHAT_ERROR_MESSAGES_NB.rate_limit_exceeded;
    }

    if (error.status === 503 || error.status === 502) {
      return CHAT_ERROR_MESSAGES_NB.llm_unavailable;
    }
  }

  if (error instanceof TypeError) {
    return 'Kunne ikke nå serveren. Sjekk nettverket og prøv igjen.';
  }

  return CHAT_SEARCH_ERROR_MESSAGE;
}

export const PRODUCT_NOT_FOUND_MESSAGE =
  'Produktet ble ikke funnet. Det kan være fjernet fra katalogen.';

export const PRODUCT_LOAD_ERROR_MESSAGE =
  'Kunne ikke laste produktet. Prøv igjen om litt.';
