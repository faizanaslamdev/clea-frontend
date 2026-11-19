import type { ShopCategory } from '@/lib/api/chat-types';

/**
 * The homepage's "Kle deg for anledningen" tiles: the same four occasions
 * and questions as the app's Home. One click sends the question to the
 * stylist, which answers with a whole outfit.
 */
export interface HomeOccasion {
  id: string;
  label: string;
  prompt: string;
  /** Catalog search that gives the cover photo, per audience. */
  cover: Record<ShopCategory, string>;
}

export const HOME_OCCASIONS: readonly HomeOccasion[] = [
  {
    id: 'julebord',
    label: 'Julebord',
    prompt: 'Julebord på fredag. Hva skal jeg ha på meg?',
    cover: { womens: 'festkjole', mens: 'blazer' },
  },
  {
    id: 'hyttetur',
    label: 'Hyttetur',
    prompt: 'Hyttetur i helgen. Hva trenger jeg?',
    cover: { womens: 'strikkegenser', mens: 'strikkegenser' },
  },
  {
    id: 'jobbintervju',
    label: 'Jobbintervju',
    prompt: 'Jobbintervju på mandag. Hva tar jeg på meg?',
    cover: { womens: 'blazer', mens: 'skjorte' },
  },
  {
    id: 'date',
    label: 'Første date',
    prompt: 'Første date på lørdag. Hva skal jeg ha på meg?',
    cover: { womens: 'midikjole', mens: 'poloskjorte' },
  },
];

/** The eight colours on the homepage, in the app's order. */
export const HOME_COLOURS = ['black', 'white', 'beige', 'brown', 'grey', 'blue', 'green', 'red'] as const;
