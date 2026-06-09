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
  return resolveApiBaseUrl(process.env);
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

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });

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
