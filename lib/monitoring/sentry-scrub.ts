import type { ErrorEvent } from '@sentry/nextjs';

const SENSITIVE_HEADER_KEYS = new Set(['authorization', 'cookie']);

export function scrubSentryEvent(event: ErrorEvent): ErrorEvent {
  if (event.request?.headers) {
    for (const key of Object.keys(event.request.headers)) {
      if (SENSITIVE_HEADER_KEYS.has(key.toLowerCase())) {
        event.request.headers[key] = '[Filtered]';
      }
    }
  }

  return event;
}
