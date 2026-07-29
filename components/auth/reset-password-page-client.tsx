'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PageLayout } from '@/components/layout/page-layout';
import { PasswordInput } from '@/components/auth/password-input';
import { resetPassword } from '@/lib/auth/client';
import { mapAuthErrorMessage } from '@/lib/auth/errors';
import {
  hasFieldErrors,
  validateNewPasswordFields,
} from '@/lib/auth/validation';

export function ResetPasswordPageClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  const resetErrors = validateNewPasswordFields(password, confirmPassword);
  const isFormValid = Boolean(token) && !hasFieldErrors(resetErrors);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current || info) return;

    setError(null);
    setInfo(null);
    setTouched({ password: true, confirmPassword: true });

    if (!token) {
      setError('Lenken er ugyldig eller utløpt. Be om en ny tilbakestillingslenke.');
      return;
    }

    if (!isFormValid) return;

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await resetPassword({
        newPassword: password,
        token,
      });

      if (result.error) {
        setError(mapAuthErrorMessage(result.error));
        return;
      }

      setInfo('Passordet er oppdatert. Du kan nå logge inn.');
    } catch {
      setError('Kunne ikke oppdatere passordet akkurat nå. Prøv igjen.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <PageLayout mainClassName="section-container section-shell py-16">
      <div className="auth-page mx-auto max-w-md">
        <h1 className="type-heading mb-3">Tilbakestill passord</h1>
        <p className="type-subheading mb-8 text-muted-foreground">
          Velg et nytt passord for kontoen din.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <Label htmlFor="reset-password">Nytt passord</Label>
            <PasswordInput
              id="reset-password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              disabled={isSubmitting || Boolean(info)}
              aria-invalid={
                (touched.password && Boolean(resetErrors.password)) || undefined
              }
              aria-describedby={
                touched.password && resetErrors.password
                  ? 'reset-password-error reset-password-hint'
                  : 'reset-password-hint'
              }
              onBlur={() =>
                setTouched((state) => ({ ...state, password: true }))
              }
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
            />
            {touched.password && resetErrors.password ? (
              <p id="reset-password-error" className="auth-form__field-error">
                {resetErrors.password}
              </p>
            ) : null}
            <p id="reset-password-hint" className="auth-form__hint">
              Bruk minst 8 tegn. Et unikt passord anbefales.
            </p>
          </div>

          <div className="auth-form__field">
            <Label htmlFor="reset-password-confirm">Bekreft passord</Label>
            <PasswordInput
              id="reset-password-confirm"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              disabled={isSubmitting || Boolean(info)}
              aria-invalid={
                (touched.confirmPassword &&
                  Boolean(resetErrors.confirmPassword)) ||
                undefined
              }
              aria-describedby={
                touched.confirmPassword && resetErrors.confirmPassword
                  ? 'reset-confirm-error'
                  : undefined
              }
              onBlur={() =>
                setTouched((state) => ({ ...state, confirmPassword: true }))
              }
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setError(null);
              }}
            />
            {touched.confirmPassword && resetErrors.confirmPassword ? (
              <p id="reset-confirm-error" className="auth-form__field-error">
                {resetErrors.confirmPassword}
              </p>
            ) : null}
          </div>

          {error ? (
            <p className="auth-form__error" role="alert" aria-live="assertive">
              {error}
            </p>
          ) : null}
          {info ? (
            <p className="auth-form__info" role="status" aria-live="polite">
              {info}
            </p>
          ) : null}

          <Button
            type="submit"
            className="auth-form__submit"
            disabled={!isFormValid || isSubmitting || Boolean(info)}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="animate-spin" aria-hidden />
                Lagrer…
              </>
            ) : info ? (
              <>
                <CheckCircle2 aria-hidden />
                Passord oppdatert
              </>
            ) : (
              'Oppdater passord'
            )}
          </Button>
        </form>

        <p className="auth-form__switch mt-6">
          <Link href="/" className="auth-form__link">
            Tilbake til forsiden
          </Link>
        </p>
      </div>
    </PageLayout>
  );
}
