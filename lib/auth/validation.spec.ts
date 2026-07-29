import { describe, expect, it } from 'vitest';
import {
  hasFieldErrors,
  normalizeEmail,
  validateEmail,
  validateNewPasswordFields,
  validateSignInFields,
  validateSignUpFields,
} from './validation';

describe('auth form validation', () => {
  it('blocks empty sign-in fields', () => {
    const errors = validateSignInFields('', '');
    expect(errors.email).toBeTruthy();
    expect(errors.password).toBeTruthy();
    expect(hasFieldErrors(errors)).toBe(true);
  });

  it('blocks invalid email addresses', () => {
    expect(validateEmail('not-an-email')).toBe(
      'Skriv inn en gyldig e-postadresse.',
    );
  });

  it('trims and normalizes email addresses', () => {
    expect(normalizeEmail('  USER@Example.COM ')).toBe('user@example.com');
  });

  it('enforces password length and confirmation', () => {
    expect(validateSignUpFields('user@example.com', 'short', 'other')).toEqual({
      email: undefined,
      password: 'Passordet må inneholde minst 8 tegn.',
      confirmPassword: 'Passordene er ikke like.',
    });
    expect(validateNewPasswordFields('long-enough', 'long-enough')).toEqual({
      password: undefined,
    });
  });
});
