import { describe, expect, it } from 'vitest';
import { mapAuthErrorMessage } from './errors';

describe('mapAuthErrorMessage', () => {
  it('maps unverified email attempts', () => {
    expect(mapAuthErrorMessage({ status: 403 })).toContain('Bekreft e-post');
    expect(
      mapAuthErrorMessage({ message: 'Please verify your email' }),
    ).toContain('Bekreft e-post');
  });

  it('maps invalid credentials', () => {
    expect(
      mapAuthErrorMessage({
        code: 'INVALID_EMAIL_OR_PASSWORD',
        status: 401,
      }),
    ).toContain('Feil e-post eller passord');
  });

  it('maps already-exists, password and rate-limit failures', () => {
    expect(
      mapAuthErrorMessage({ message: 'User already exists' }),
    ).toContain('allerede en konto');
    expect(
      mapAuthErrorMessage({ message: 'Password too short' }),
    ).toContain('minst 8 tegn');
    expect(mapAuthErrorMessage({ status: 429 })).toContain('For mange forsøk');
    expect(
      mapAuthErrorMessage({ message: 'Too many requests' }),
    ).toContain('For mange forsøk');
  });

  it('falls back to a generic message without leaking raw errors', () => {
    expect(mapAuthErrorMessage(null)).toBe('Noe gikk galt. Prøv igjen.');
    expect(
      mapAuthErrorMessage({ message: 'Internal stack dump from provider' }),
    ).toBe('Noe gikk galt. Prøv igjen.');
  });
});
