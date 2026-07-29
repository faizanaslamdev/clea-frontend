'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/auth/password-input';
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
import {
  hasFieldErrors,
  normalizeEmail,
  validateSignInFields,
} from '@/lib/auth/validation';

interface SignInFormProps {
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
  onNeedsVerification: (email?: string) => void;
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
  const submittingRef = useRef(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const fieldErrors = validateSignInFields(email, password);
  const isFormValid = !hasFieldErrors(fieldErrors);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    setTouched({ email: true, password: true });
    if (!isFormValid) return;

    setError(null);
    setInfo(null);
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await signIn.email({
        email: normalizeEmail(email),
        password,
        callbackURL: resolvePostAuthReturnTo({ fallback: '/account' }),
      });

      if (result.error) {
        if (result.error.status === 403) {
          onNeedsVerification(normalizeEmail(email));
          return;
        }

        setError(mapAuthErrorMessage(result.error));
        return;
      }

      await refetch();
      refreshPendingAction();

      const pendingAction = readPendingAction();
      if (pendingAction) {
        setInfo(buildPendingActionResumeMessage(pendingAction));
      }

      const returnTo = resolvePostAuthReturnTo({
        pendingReturnTo: pendingAction?.returnTo,
        fallback: '/account',
      });
      clearReturnTo();
      router.replace(returnTo);
      onSuccess();
    } catch {
      setError('Kunne ikke logge inn akkurat nå. Prøv igjen.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
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
          disabled={isSubmitting}
          aria-invalid={(touched.email && Boolean(fieldErrors.email)) || undefined}
          aria-describedby={
            touched.email && fieldErrors.email ? 'sign-in-email-error' : undefined
          }
          onBlur={() => setTouched((state) => ({ ...state, email: true }))}
          onChange={(event) => {
            setEmail(event.target.value);
            setError(null);
          }}
        />
        {touched.email && fieldErrors.email ? (
          <p id="sign-in-email-error" className="auth-form__field-error">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="auth-form__field">
        <Label htmlFor="sign-in-password">Passord</Label>
        <PasswordInput
          id="sign-in-password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          disabled={isSubmitting}
          aria-invalid={
            (touched.password && Boolean(fieldErrors.password)) || undefined
          }
          aria-describedby={
            touched.password && fieldErrors.password
              ? 'sign-in-password-error'
              : undefined
          }
          onBlur={() => setTouched((state) => ({ ...state, password: true }))}
          onChange={(event) => {
            setPassword(event.target.value);
            setError(null);
          }}
        />
        {touched.password && fieldErrors.password ? (
          <p id="sign-in-password-error" className="auth-form__field-error">
            {fieldErrors.password}
          </p>
        ) : null}
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

      <Button
        type="submit"
        className="auth-form__submit"
        disabled={!isFormValid || isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="animate-spin" aria-hidden />
            Logger inn…
          </>
        ) : (
          'Logg inn'
        )}
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
