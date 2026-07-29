import type { ErrorEvent } from '@sentry/nextjs';

const SENSITIVE_HEADER_KEYS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-admin-api-key',
]);

const SENSITIVE_FIELD_KEYS = new Set([
  'password',
  'newpassword',
  'oldpassword',
  'currentpassword',
  'confirmpassword',
  'token',
  'accesstoken',
  'refreshtoken',
  'idtoken',
  'sessiontoken',
  'secret',
  'authorization',
  'cookie',
  'set-cookie',
  'email',
  'otp',
  'code',
]);

const FILTERED = '[Filtered]';

function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (SENSITIVE_FIELD_KEYS.has(normalized)) {
    return true;
  }
  return (
    normalized.includes('password') ||
    normalized.includes('token') ||
    normalized.includes('secret') ||
    normalized.includes('authorization') ||
    normalized.includes('cookie') ||
    normalized === 'email'
  );
}

function scrubValue(value: unknown, depth = 0): unknown {
  if (depth > 8 || value == null) {
    return value;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => scrubValue(item, depth + 1));
  }

  if (typeof value === 'object') {
    const input = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(input)) {
      output[key] = isSensitiveKey(key)
        ? FILTERED
        : scrubValue(nested, depth + 1);
    }
    return output;
  }

  return value;
}

function scrubUrl(url: string | undefined): string | undefined {
  if (!url) {
    return url;
  }

  try {
    const parsed = new URL(url, 'https://www.clea.no');
    for (const key of [...parsed.searchParams.keys()]) {
      if (isSensitiveKey(key)) {
        parsed.searchParams.set(key, FILTERED);
      }
    }
    return parsed.toString().replace('https://www.clea.no', '');
  } catch {
    return url;
  }
}

export function scrubSentryEvent(event: ErrorEvent): ErrorEvent {
  if (event.request?.headers) {
    for (const key of Object.keys(event.request.headers)) {
      if (SENSITIVE_HEADER_KEYS.has(key.toLowerCase())) {
        event.request.headers[key] = FILTERED;
      }
    }
  }

  if (event.request?.data) {
    event.request.data = scrubValue(event.request.data) as typeof event.request.data;
  }

  if (event.request?.query_string) {
    if (typeof event.request.query_string === 'string') {
      event.request.query_string =
        scrubUrl(`https://x.local/?${event.request.query_string}`)?.split('?')[1] ??
        FILTERED;
    } else {
      event.request.query_string = scrubValue(
        event.request.query_string,
      ) as typeof event.request.query_string;
    }
  }

  if (event.request?.url) {
    event.request.url = scrubUrl(event.request.url) ?? event.request.url;
  }

  if (event.extra) {
    event.extra = scrubValue(event.extra) as typeof event.extra;
  }

  if (event.contexts) {
    event.contexts = scrubValue(event.contexts) as typeof event.contexts;
  }

  if (event.user) {
    event.user = {
      ...event.user,
      email: event.user.email ? FILTERED : event.user.email,
      username: event.user.username ? FILTERED : event.user.username,
      ip_address: event.user.ip_address ? FILTERED : event.user.ip_address,
    };
  }

  if (Array.isArray(event.breadcrumbs)) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => ({
      ...breadcrumb,
      data: breadcrumb.data
        ? (scrubValue(breadcrumb.data) as typeof breadcrumb.data)
        : breadcrumb.data,
      message: breadcrumb.message,
    }));
  }

  return event;
}
