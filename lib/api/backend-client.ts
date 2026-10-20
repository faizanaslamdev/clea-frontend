import * as Sentry from '@sentry/nextjs';
import { resolveApiBaseUrl } from './api-base-url.mjs';

interface ApiErrorBody {
  code?: string;
  message?: string;
}

function parseApiErrorBody(text: string): ApiErrorBody | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith('{')) {
    return null;
  }

  try {
    return JSON.parse(trimmed) as ApiErrorBody;
  } catch {
    return null;
  }
}

export function getApiBaseUrl(): string {
  // Next.js only inlines NEXT_PUBLIC_* when accessed directly — not via process.env passthrough.
  return resolveApiBaseUrl({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Server renders must not hang on a slow API; browsers get a little longer. */
export const API_TIMEOUT_SERVER_MS = 10_000;
export const API_TIMEOUT_BROWSER_MS = 20_000;

export interface ApiFetchInit extends RequestInit {
  /** Abort after this many ms (default depends on server vs browser). */
  timeoutMs?: number;
}

function defaultTimeoutMs(): number {
  return typeof window === 'undefined'
    ? API_TIMEOUT_SERVER_MS
    : API_TIMEOUT_BROWSER_MS;
}

/** Caller's signal (e.g. TanStack's) combined with the timeout. */
function withTimeout(
  signal: AbortSignal | null | undefined,
  timeoutMs: number,
): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  if (!signal) return timeout;
  if (typeof AbortSignal.any === 'function') {
    return AbortSignal.any([signal, timeout]);
  }
  return signal;
}

function isTimeoutError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'TimeoutError' || error.name === 'AbortError')
  );
}

/**
 * Server-rendered pages call the API from Vercel's shared IPs on behalf of
 * every visitor; the shared key tells the API not to rate-limit those calls
 * per IP. CLEA_SSR_API_KEY has no NEXT_PUBLIC_ prefix, so it never reaches
 * the browser bundle, and the header is only added on the server.
 */
export function serverOnlyHeaders(): Record<string, string> {
  if (typeof window !== 'undefined') return {};
  const key = process.env.CLEA_SSR_API_KEY?.trim();
  return key ? { 'x-clea-ssr-key': key } : {};
}

export async function apiFetch<T>(
  path: string,
  init?: ApiFetchInit,
): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const { timeoutMs = defaultTimeoutMs(), signal, ...requestInit } = init ?? {};

  let response: Response;
  try {
    response = await fetch(url, {
      ...requestInit,
      signal: withTimeout(signal, timeoutMs),
      credentials: requestInit.credentials ?? 'include',
      headers: {
        Accept: 'application/json',
        ...serverOnlyHeaders(),
        ...requestInit.headers,
      },
    });
  } catch (error) {
    if (isTimeoutError(error) && !signal?.aborted) {
      throw new ApiError(
        `API timed out after ${timeoutMs} ms for ${path}`,
        0,
        'timeout',
      );
    }
    throw error;
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    const parsed = parseApiErrorBody(detail);
    const apiError = new ApiError(
      parsed?.message || detail || `API ${response.status} for ${path}`,
      response.status,
      parsed?.code,
    );

    if (response.status >= 500 && process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()) {
      Sentry.captureException(apiError, {
        tags: { apiPath: path, statusCode: String(response.status) },
      });
    }

    throw apiError;
  }

  return response.json() as Promise<T>;
}
