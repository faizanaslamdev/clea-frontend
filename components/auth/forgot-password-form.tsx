'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPasswordReset } from '@/lib/auth/client';
import { mapAuthErrorMessage } from '@/lib/auth/errors';

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
}

export function ForgotPasswordForm({ onBackToSignIn }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    const result = await requestPasswordReset({
      email: email.trim(),
      redirectTo: '/reset-password',
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(mapAuthErrorMessage(result.error));
      return;
    }

    setInfo('Hvis kontoen finnes, har vi sendt en e-post med instruksjoner.');
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
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? formErrorId : undefined}
          onChange={(event) => setEmail(event.target.value)}
        />
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

      <Button type="submit" className="auth-form__submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sender…' : 'Send tilbakestillingslenke'}
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
