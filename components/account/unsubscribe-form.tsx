'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { unsubscribeFromTrack } from '@/lib/api/notifications';
import { Button } from '@/components/ui/button';

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

export function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const [state, setState] = useState<State>(
    token ? { kind: 'idle' } : { kind: 'error', message: 'Mangler stopplenke.' },
  );
  const [isPending, startTransition] = useTransition();
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) {
      return;
    }
    started.current = true;
    startTransition(() => {
      void (async () => {
        setState({ kind: 'loading' });
        try {
          const result = await unsubscribeFromTrack(token);
          setState({ kind: 'success', message: result.message });
        } catch {
          setState({
            kind: 'error',
            message:
              'Kunne ikke stoppe varslingen. Lenken kan være ugyldig eller utløpt.',
          });
        }
      })();
    });
  }, [token]);

  if (state.kind === 'loading' || isPending) {
    return <p className="account-page__section-copy">Stopper varsling…</p>;
  }

  if (state.kind === 'success') {
    return (
      <div>
        <p className="account-page__section-copy">{state.message}</p>
        <p className="mt-4">
          <Link href="/account/tracks" className="auth-form__link">
            Se prisvarsler
          </Link>
        </p>
      </div>
    );
  }

  if (state.kind === 'error') {
    return (
      <div>
        <p className="auth-form__error" role="alert">
          {state.message}
        </p>
        <p className="mt-4">
          <Link href="/account/tracks" className="auth-form__link">
            Administrer prisvarsler
          </Link>
        </p>
      </div>
    );
  }

  return (
    <Button
      type="button"
      disabled={!token || isPending}
      onClick={() => {
        startTransition(() => {
          void (async () => {
            setState({ kind: 'loading' });
            try {
              const result = await unsubscribeFromTrack(token);
              setState({ kind: 'success', message: result.message });
            } catch {
              setState({
                kind: 'error',
                message:
                  'Kunne ikke stoppe varslingen. Lenken kan være ugyldig eller utløpt.',
              });
            }
          })();
        });
      }}
    >
      Stopp varsling
    </Button>
  );
}
