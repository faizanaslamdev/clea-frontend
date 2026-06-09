import * as Sentry from '@sentry/nextjs';
import { scrubSentryEvent } from './lib/monitoring/sentry-scrub';

const dsn = process.env.SENTRY_DSN?.trim() ?? process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment:
    process.env.SENTRY_ENVIRONMENT?.trim() ??
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT?.trim() ??
    process.env.NODE_ENV ??
    'development',
  release: process.env.SENTRY_RELEASE?.trim(),
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  beforeSend: scrubSentryEvent,
});
