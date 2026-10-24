'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { recoverFromChunkLoadError } from '@/lib/ui/chunk-load-recovery';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // A tab opened before a deploy asking for code that no longer exists:
    // reload once to the current version instead of showing this screen.
    if (recoverFromChunkLoadError(error)) return;
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="section-container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Noe gikk galt</h1>
      <p className="max-w-md text-muted-foreground">
        Vi kunne ikke laste denne siden. Prøv igjen om litt.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-md bg-foreground px-4 py-2 text-sm text-background"
      >
        Prøv igjen
      </button>
    </main>
  );
}
