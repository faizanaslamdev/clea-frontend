'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUp } from '@/lib/auth/client';
import { mapAuthErrorMessage } from '@/lib/auth/errors';
import { resolvePostAuthReturnTo } from '@/lib/auth/return-to';

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
  onNeedsVerification: () => void;
}

export function SignUpForm({
  onSwitchToSignIn,
  onNeedsVerification,
}: SignUpFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signUp.email({
      name: name.trim() || email.trim().split('@')[0] || 'Bruker',
      email: email.trim(),
      password,
      callbackURL: resolvePostAuthReturnTo({ fallback: '/account' }),
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(mapAuthErrorMessage(result.error));
      return;
    }

    // Pending Notify Me action remains in sessionStorage until Phase 2 succeeds.
    onNeedsVerification();
  }

  const formErrorId = 'sign-up-form-error';

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form__field">
        <Label htmlFor="sign-up-name">Navn</Label>
        <Input
          id="sign-up-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Valgfritt"
        />
      </div>

      <div className="auth-form__field">
        <Label htmlFor="sign-up-email">E-post</Label>
        <Input
          id="sign-up-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? formErrorId : undefined}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="auth-form__field">
        <Label htmlFor="sign-up-password">Passord</Label>
        <Input
          id="sign-up-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? formErrorId : 'sign-up-password-hint'}
          onChange={(event) => setPassword(event.target.value)}
        />
        <p id="sign-up-password-hint" className="auth-form__hint">
          Minst 8 tegn
        </p>
      </div>

      {error ? (
        <p id={formErrorId} className="auth-form__error" role="alert" aria-live="assertive">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="auth-form__submit" disabled={isSubmitting}>
        {isSubmitting ? 'Oppretter konto…' : 'Opprett konto'}
      </Button>

      <p className="auth-form__switch">
        Har du allerede konto?{' '}
        <button
          type="button"
          className="auth-form__link"
          onClick={onSwitchToSignIn}
        >
          Logg inn
        </button>
      </p>
    </form>
  );
}
