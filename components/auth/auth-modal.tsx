'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useModalInteractionRecovery } from '@/lib/hooks/useModalInteractionRecovery';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { SignInForm } from '@/components/auth/sign-in-form';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { VerifyEmailPrompt } from '@/components/auth/verify-email-prompt';
import type { AuthView } from '@/lib/auth/errors';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: AuthView;
}

const VIEW_COPY: Record<AuthView, { title: string; description: string }> = {
  'sign-in': {
    title: 'Logg inn',
    description: 'Logg inn for å få prisvarsler når produkter blir billigere.',
  },
  'sign-up': {
    title: 'Opprett konto',
    description: 'Opprett en konto for å følge prisfall på favorittproduktene dine.',
  },
  'forgot-password': {
    title: 'Glemt passord',
    description: 'Vi sender deg en lenke for å tilbakestille passordet.',
  },
  'verify-email': {
    title: 'Bekreft e-post',
    description: 'Sjekk innboksen din og bekreft e-postadressen for å fortsette.',
  },
};

export function AuthModal({
  open,
  onOpenChange,
  initialView = 'sign-in',
}: AuthModalProps) {
  const [view, setView] = useState<AuthView>(initialView);
  const [verificationEmail, setVerificationEmail] = useState<string>();
  const interactionRecoveryEpoch = useModalInteractionRecovery(open);

  useEffect(() => {
    if (open) {
      setView(initialView);
    }
  }, [initialView, open]);

  const copy = VIEW_COPY[view];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        key={interactionRecoveryEpoch}
        className="auth-modal sm:max-w-md"
        showCloseButton
      >
        <DialogHeader className="auth-modal__header">
          <DialogTitle className="auth-modal__title">{copy.title}</DialogTitle>
          <DialogDescription className="auth-modal__description">
            {copy.description}
          </DialogDescription>
        </DialogHeader>

        <div className="auth-modal__body">
          {view === 'sign-in' ? (
            <SignInForm
              onSwitchToSignUp={() => setView('sign-up')}
              onForgotPassword={() => setView('forgot-password')}
              onNeedsVerification={(email) => {
                setVerificationEmail(email);
                setView('verify-email');
              }}
              onSuccess={() => onOpenChange(false)}
            />
          ) : null}

          {view === 'sign-up' ? (
            <SignUpForm
              onSwitchToSignIn={() => setView('sign-in')}
              onNeedsVerification={(email) => {
                setVerificationEmail(email);
                setView('verify-email');
              }}
            />
          ) : null}

          {view === 'forgot-password' ? (
            <ForgotPasswordForm onBackToSignIn={() => setView('sign-in')} />
          ) : null}

          {view === 'verify-email' ? (
            <VerifyEmailPrompt
              submittedEmail={verificationEmail}
              onBackToSignIn={() => setView('sign-in')}
            />
          ) : null}
        </div>

        <p className="auth-modal__legal">
          Ved å fortsette godtar du våre{' '}
          <Link href="/terms" className="auth-modal__legal-link">
            vilkår
          </Link>{' '}
          og{' '}
          <Link href="/privacy" className="auth-modal__legal-link">
            personvernregler
          </Link>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
}
