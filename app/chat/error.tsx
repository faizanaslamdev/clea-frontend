'use client';

import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ChatError({
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
    <main className="chat-page section-container flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Chatten er utilgjengelig</h1>
      <p className="max-w-md text-muted-foreground">
        Vi kunne ikke laste chatten. Prøv igjen eller gå tilbake til forsiden.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background"
        >
          Prøv igjen
        </button>
        <Link
          href="/"
          className="rounded-md border border-border px-4 py-2 text-sm"
        >
          Til forsiden
        </Link>
      </div>
    </main>
  );
}
