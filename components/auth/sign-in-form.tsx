'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthModal } from '@/components/auth/auth-provider';
import { signIn, useSession } from '@/lib/auth/client';
import { mapAuthErrorMessage } from '@/lib/auth/errors';
import {
  buildPendingActionResumeMessage,
  readPendingAction,
} from '@/lib/auth/pending-action';
import {
  clearReturnTo,
  resolvePostAuthReturnTo,
} from '@/lib/auth/return-to';

interface SignInFormProps {
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
  onNeedsVerification: () => void;
  onSuccess: () => void;
}

export function SignInForm({
  onSwitchToSignUp,
  onForgotPassword,
  onNeedsVerification,
  onSuccess,
}: SignInFormProps) {
  const { refreshPendingAction } = useAuthModal();
  const { refetch } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    const result = await signIn.email({
      email: email.trim(),
      password,
      callbackURL: resolvePostAuthReturnTo({ fallback: '/account' }),
    });

    setIsSubmitting(false);

    if (result.error) {
      if (result.error.status === 403) {
        onNeedsVerification();
        return;
      }

      setError(mapAuthErrorMessage(result.error));
      return;
    }

    await refetch();
    refreshPendingAction();

    const pendingAction = readPendingAction();
    if (pendingAction) {
      // Keep pending action for Phase 2 — do not clear on auth success.
      setInfo(buildPendingActionResumeMessage(pendingAction));
    }

    const returnTo = resolvePostAuthReturnTo({
      pendingReturnTo: pendingAction?.returnTo,
      fallback: '/account',
    });
    clearReturnTo();
    router.replace(returnTo);
    onSuccess();
  }

  const formErrorId = 'sign-in-form-error';
  const formInfoId = 'sign-in-form-info';

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form__field">
        <Label htmlFor="sign-in-email">E-post</Label>
        <Input
          id="sign-in-email"
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
        <Label htmlFor="sign-in-password">Passord</Label>
        <Input
          id="sign-in-password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? formErrorId : undefined}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <div className="auth-form__actions">
        <button
          type="button"
          className="auth-form__link"
          onClick={onForgotPassword}
        >
          Glemt passord?
        </button>
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
        {isSubmitting ? 'Logger inn…' : 'Logg inn'}
      </Button>

      <p className="auth-form__switch">
        Har du ikke konto?{' '}
        <button
          type="button"
          className="auth-form__link"
          onClick={onSwitchToSignUp}
        >
          Opprett konto
        </button>
      </p>
    </form>
  );
}
