'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="nb">
      <body className="bg-background text-foreground">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-2xl font-semibold">Noe gikk galt</h1>
          <p className="text-muted-foreground">
            Vi kunne ikke laste siden. Prøv igjen om litt.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-foreground px-4 py-2 text-sm text-background"
          >
            Prøv igjen
          </button>
        </main>
      </body>
    </html>
  );
}
