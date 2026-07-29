import { describe, expect, it } from 'vitest';
import { mapAuthErrorMessage } from './errors';

describe('mapAuthErrorMessage', () => {
  it('maps unverified email attempts', () => {
    expect(mapAuthErrorMessage({ status: 403 })).toContain('Bekreft e-post');
  });

  it('maps invalid credentials', () => {
    expect(
      mapAuthErrorMessage({
        code: 'INVALID_EMAIL_OR_PASSWORD',
        status: 401,
      }),
    ).toContain('Feil e-post eller passord');
  });

  it('falls back to a generic message', () => {
    expect(mapAuthErrorMessage(null)).toBe('Noe gikk galt. Prøv igjen.');
  });
});
