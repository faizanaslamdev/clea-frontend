'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { sendVerificationEmail } from '@/lib/auth/client';
import { mapAuthErrorMessage } from '@/lib/auth/errors';

interface VerifyEmailBannerProps {
  email: string;
}

export function VerifyEmailBanner({ email }: VerifyEmailBannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleResend() {
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

    setInfo('Ny bekreftelseslenke er sendt.');
  }

  return (
    <section className="account-page__banner" aria-live="polite">
      <div>
        <p className="account-page__banner-title">Bekreft e-postadressen din</p>
        <p className="account-page__banner-copy">
          Du må bekrefte {email} før du kan bruke prisvarsler.
        </p>
        {error ? <p className="auth-form__error">{error}</p> : null}
        {info ? <p className="auth-form__info">{info}</p> : null}
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={isSubmitting}
        onClick={handleResend}
      >
        {isSubmitting ? 'Sender…' : 'Send på nytt'}
      </Button>
    </section>
  );
}
