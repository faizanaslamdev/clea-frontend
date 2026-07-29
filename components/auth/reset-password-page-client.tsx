'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageLayout } from '@/components/layout/page-layout';
import { resetPassword } from '@/lib/auth/client';
import { mapAuthErrorMessage } from '@/lib/auth/errors';

export function ResetPasswordPageClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (!token) {
      setError('Lenken er ugyldig eller utløpt. Be om en ny tilbakestillingslenke.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passordene er ikke like.');
      return;
    }

    setIsSubmitting(true);

    const result = await resetPassword({
      newPassword: password,
      token,
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(mapAuthErrorMessage(result.error));
      return;
    }

    setInfo('Passordet er oppdatert. Du kan nå logge inn.');
  }

  return (
    <PageLayout mainClassName="section-container section-shell py-16">
      <div className="auth-page mx-auto max-w-md">
        <h1 className="type-heading mb-3">Tilbakestill passord</h1>
        <p className="type-subheading mb-8 text-muted-foreground">
          Velg et nytt passord for kontoen din.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__field">
            <Label htmlFor="reset-password">Nytt passord</Label>
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="auth-form__field">
            <Label htmlFor="reset-password-confirm">Bekreft passord</Label>
            <Input
              id="reset-password-confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          {error ? <p className="auth-form__error">{error}</p> : null}
          {info ? <p className="auth-form__info">{info}</p> : null}

          <Button
            type="submit"
            className="auth-form__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Lagrer…' : 'Oppdater passord'}
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
