'use client';

import { useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/auth/password-input';
import { signUp } from '@/lib/auth/client';
import { mapAuthErrorMessage } from '@/lib/auth/errors';
import { resolvePostAuthReturnTo } from '@/lib/auth/return-to';
import {
  hasFieldErrors,
  normalizeEmail,
  validateSignUpFields,
} from '@/lib/auth/validation';

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
  onNeedsVerification: (email: string) => void;
}

export function SignUpForm({
  onSwitchToSignIn,
  onNeedsVerification,
}: SignUpFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });

  const fieldErrors = validateSignUpFields(email, password, confirmPassword);
  const isFormValid = !hasFieldErrors(fieldErrors);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    setTouched({ email: true, password: true, confirmPassword: true });
    if (!isFormValid) return;

    setError(null);
    submittingRef.current = true;
    setIsSubmitting(true);

    const normalizedEmail = normalizeEmail(email);
    try {
      const result = await signUp.email({
        name: name.trim() || normalizedEmail.split('@')[0] || 'Bruker',
        email: normalizedEmail,
        password,
        callbackURL: resolvePostAuthReturnTo({ fallback: '/account' }),
      });

      if (result.error) {
        setError(mapAuthErrorMessage(result.error));
        return;
      }

      onNeedsVerification(normalizedEmail);
    } catch {
      setError('Kunne ikke opprette kontoen akkurat nå. Prøv igjen.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
          aria-invalid={(touched.email && Boolean(fieldErrors.email)) || undefined}
          aria-describedby={
            touched.email && fieldErrors.email ? 'sign-up-email-error' : undefined
          }
          onBlur={() => setTouched((state) => ({ ...state, email: true }))}
          onChange={(event) => {
            setEmail(event.target.value);
            setError(null);
          }}
        />
        {touched.email && fieldErrors.email ? (
          <p id="sign-up-email-error" className="auth-form__field-error">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="auth-form__field">
        <Label htmlFor="sign-up-password">Passord</Label>
        <PasswordInput
          id="sign-up-password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          disabled={isSubmitting}
          aria-invalid={
            (touched.password && Boolean(fieldErrors.password)) || undefined
          }
          aria-describedby={
            touched.password && fieldErrors.password
              ? 'sign-up-password-error sign-up-password-hint'
              : 'sign-up-password-hint'
          }
          onBlur={() => setTouched((state) => ({ ...state, password: true }))}
          onChange={(event) => {
            setPassword(event.target.value);
            setError(null);
          }}
        />
        {touched.password && fieldErrors.password ? (
          <p id="sign-up-password-error" className="auth-form__field-error">
            {fieldErrors.password}
          </p>
        ) : null}
        <p id="sign-up-password-hint" className="auth-form__hint">
          Bruk minst 8 tegn. Et unikt passord anbefales.
        </p>
      </div>

      <div className="auth-form__field">
        <Label htmlFor="sign-up-password-confirm">Bekreft passord</Label>
        <PasswordInput
          id="sign-up-password-confirm"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          disabled={isSubmitting}
          aria-invalid={
            (touched.confirmPassword &&
              Boolean(fieldErrors.confirmPassword)) ||
            undefined
          }
          aria-describedby={
            touched.confirmPassword && fieldErrors.confirmPassword
              ? 'sign-up-confirm-error'
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
        {touched.confirmPassword && fieldErrors.confirmPassword ? (
          <p id="sign-up-confirm-error" className="auth-form__field-error">
            {fieldErrors.confirmPassword}
          </p>
        ) : null}
      </div>

      {error ? (
        <p id={formErrorId} className="auth-form__error" role="alert" aria-live="assertive">
          {error}
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
            Oppretter konto…
          </>
        ) : (
          'Opprett konto'
        )}
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
