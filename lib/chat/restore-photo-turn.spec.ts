import { describe, expect, it } from 'vitest';
import { mapRestoreConversationToMessages } from './restore-conversation-messages';

describe('restoring a photo search', () => {
  it('shows a photo bubble and "Clea ser" instead of the search text', () => {
    const messages = mapRestoreConversationToMessages({
      conversationId: 'c',
      turns: [
        {
          seq: 1,
          role: 'user',
          message: 'Finn lignende: rød strikket polo dame',
          clientTurnId: 't1',
          photoSearch: { summary: 'En marineblå strikket polo.', note: 'i rødt' },
        },
        { seq: 2, role: 'assistant', message: 'Her er det som ligner mest.', reply: 'Her er det som ligner mest.', products: [] },
      ],
    } as never);
    expect(messages[0]).toMatchObject({ role: 'user', content: 'i rødt', photo: { url: '', summary: 'En marineblå strikket polo.' } });
    expect(messages[1]).toMatchObject({ role: 'assistant', photoSummary: 'En marineblå strikket polo.' });
  });
});
