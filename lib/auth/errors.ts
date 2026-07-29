export type AuthView =
  | 'sign-in'
  | 'sign-up'
  | 'forgot-password'
  | 'verify-email';

interface AuthErrorShape {
  message?: string;
  status?: number;
  code?: string;
}

export function mapAuthErrorMessage(
  error: AuthErrorShape | null | undefined,
): string {
  const message = error?.message?.trim();
  const status = error?.status;
  const code = error?.code;

  if (status === 403 || message?.toLowerCase().includes('verify')) {
    return 'Bekreft e-postadressen din før du logger inn.';
  }

  if (code === 'INVALID_EMAIL_OR_PASSWORD' || status === 401) {
    return 'Feil e-post eller passord.';
  }

  if (message?.toLowerCase().includes('already exists')) {
    return 'Det finnes allerede en konto med denne e-postadressen.';
  }

  if (message?.toLowerCase().includes('password')) {
    return 'Passordet oppfyller ikke kravene (minst 8 tegn).';
  }

  if (status === 429 || message?.toLowerCase().includes('too many')) {
    return 'For mange forsøk. Prøv igjen om litt.';
  }

  return 'Noe gikk galt. Prøv igjen.';
}
