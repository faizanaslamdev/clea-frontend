'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { sendVerificationEmail, useSession } from '@/lib/auth/client';
import { mapAuthErrorMessage } from '@/lib/auth/errors';

interface VerifyEmailPromptProps {
  onBackToSignIn: () => void;
}

export function VerifyEmailPrompt({ onBackToSignIn }: VerifyEmailPromptProps) {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const email = session?.user.email;

  async function handleResend() {
    if (!email) {
      setError('Logg inn med e-posten din for å sende bekreftelse på nytt.');
      return;
    }

    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    const result = await sendVerificationEmail({
      email,
      callbackURL: '/account',
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(mapAuthErrorMessage(result.error));
      return;
    }

    setInfo('Vi har sendt en ny bekreftelseslenke til e-posten din.');
  }

  return (
    <div className="auth-form">
      <p className="auth-form__message">
        Sjekk innboksen din og klikk på bekreftelseslenken. Du må bekrefte
        e-posten før du kan logge inn.
      </p>

      {email ? (
        <p className="auth-form__hint">Sendt til {email}</p>
      ) : null}

      {error ? <p className="auth-form__error">{error}</p> : null}
      {info ? <p className="auth-form__info">{info}</p> : null}

      <Button
        type="button"
        className="auth-form__submit"
        disabled={isSubmitting}
        onClick={handleResend}
      >
        {isSubmitting ? 'Sender…' : 'Send bekreftelse på nytt'}
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
    </div>
  );
}
