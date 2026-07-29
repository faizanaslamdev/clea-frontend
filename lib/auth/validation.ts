export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AuthFieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): string | undefined {
  const normalized = normalizeEmail(email);
  if (!normalized) return 'Skriv inn e-postadressen din.';
  if (!EMAIL_PATTERN.test(normalized)) {
    return 'Skriv inn en gyldig e-postadresse.';
  }
  return undefined;
}

export function validatePassword(
  password: string,
  label = 'passord',
): string | undefined {
  if (!password) return `Skriv inn ${label}.`;
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Passordet må inneholde minst ${MIN_PASSWORD_LENGTH} tegn.`;
  }
  return undefined;
}

export function validateSignInFields(
  email: string,
  password: string,
): AuthFieldErrors {
  return {
    email: validateEmail(email),
    password: validatePassword(password),
  };
}

export function validateSignUpFields(
  email: string,
  password: string,
  confirmPassword: string,
): AuthFieldErrors {
  return {
    email: validateEmail(email),
    ...validateNewPasswordFields(password, confirmPassword),
  };
}

export function validateNewPasswordFields(
  password: string,
  confirmPassword: string,
): AuthFieldErrors {
  const errors: AuthFieldErrors = {
    password: validatePassword(password),
  };

  if (!confirmPassword) {
    errors.confirmPassword = 'Bekreft passordet.';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passordene er ikke like.';
  }

  return errors;
}

export function hasFieldErrors(errors: AuthFieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
