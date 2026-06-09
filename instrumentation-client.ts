import * as Sentry from '@sentry/nextjs';
import { scrubSentryEvent } from './lib/monitoring/sentry-scrub';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()),
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT?.trim() ??
    process.env.NODE_ENV ??
    'development',
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE?.trim(),
  tracesSampleRate: Number(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1,
  ),
  beforeSend: scrubSentryEvent,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
