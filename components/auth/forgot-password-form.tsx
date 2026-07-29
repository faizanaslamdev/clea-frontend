'use client';

import { useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPasswordReset } from '@/lib/auth/client';
import {
  normalizeEmail,
  validateEmail,
} from '@/lib/auth/validation';

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
}

export function ForgotPasswordForm({ onBackToSignIn }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [isTouched, setIsTouched] = useState(false);

  const emailError = validateEmail(email);
  const isFormValid = !emailError;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    setIsTouched(true);
    if (!isFormValid) return;

    setError(null);
    setInfo(null);
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      // Always show the same completion message, whether or not the account
      // exists. Better Auth handles the request without account enumeration.
      await requestPasswordReset({
        email: normalizeEmail(email),
        redirectTo: '/reset-password',
      });
      setInfo(
        'Hvis kontoen finnes, har vi sendt en e-post med instruksjoner.',
      );
    } catch {
      setError('Kunne ikke sende forespørselen akkurat nå. Prøv igjen.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  const formErrorId = 'forgot-password-form-error';
  const formInfoId = 'forgot-password-form-info';

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form__field">
        <Label htmlFor="forgot-password-email">E-post</Label>
        <Input
          id="forgot-password-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          disabled={isSubmitting || Boolean(info)}
          aria-invalid={(isTouched && Boolean(emailError)) || undefined}
          aria-describedby={
            isTouched && emailError ? 'forgot-password-email-error' : undefined
          }
          onBlur={() => setIsTouched(true)}
          onChange={(event) => {
            setEmail(event.target.value);
            setError(null);
          }}
        />
        {isTouched && emailError ? (
          <p id="forgot-password-email-error" className="auth-form__field-error">
            {emailError}
          </p>
        ) : null}
      </div>

      {error ? (
        <p id={formErrorId} className="auth-form__error" role="alert" aria-live="assertive">
          {error}
        </p>
      ) : null}
      {info ? (
        <p id={formInfoId} className="auth-form__info" role="status" aria-live="polite">
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
            Sender…
          </>
        ) : info ? (
          'E-postforespørsel sendt'
        ) : (
          'Send tilbakestillingslenke'
        )}
      </Button>

      <p className="auth-form__switch">
        <button
          type="button"
          className="auth-form__link"
          onClick={onBackToSignIn}
        >
          Tilbake til innlogging
        </button>
      </p>
    </form>
  );
}
