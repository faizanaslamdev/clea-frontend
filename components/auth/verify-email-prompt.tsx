'use client';

import { useRef, useState } from 'react';
import { LoaderCircle, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendVerificationEmail, useSession } from '@/lib/auth/client';
import { mapAuthErrorMessage } from '@/lib/auth/errors';

interface VerifyEmailPromptProps {
  onBackToSignIn: () => void;
  submittedEmail?: string;
}

export function VerifyEmailPrompt({
  onBackToSignIn,
  submittedEmail,
}: VerifyEmailPromptProps) {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const email = submittedEmail ?? session?.user.email;

  async function handleResend() {
    if (submittingRef.current) return;

    if (!email) {
      setError('Logg inn med e-posten din for å sende bekreftelse på nytt.');
      return;
    }

    setError(null);
    setInfo(null);
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await sendVerificationEmail({
        email,
        callbackURL: '/account',
      });

      if (result.error) {
        setError(mapAuthErrorMessage(result.error));
        return;
      }

      setInfo('Vi har sendt en ny bekreftelseslenke til e-posten din.');
    } catch {
      setError('Kunne ikke sende bekreftelsen akkurat nå. Prøv igjen.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-form">
      <div className="auth-form__success-icon" aria-hidden>
        <MailCheck className="size-6" />
      </div>
      <p className="auth-form__message">
        Sjekk innboksen din og klikk på bekreftelseslenken. Du må bekrefte
        e-posten før du kan logge inn.
      </p>

      {email ? (
        <p className="auth-form__email">{email}</p>
      ) : null}

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
        type="button"
        className="auth-form__submit"
        disabled={isSubmitting || !email}
        onClick={handleResend}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="animate-spin" aria-hidden />
            Sender…
          </>
        ) : (
          'Send bekreftelse på nytt'
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
    </div>
  );
}
