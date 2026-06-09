import { resolveApiBaseUrl } from './api-base-url.mjs';

export function getApiBaseUrl(): string {
  return resolveApiBaseUrl(process.env);
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
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
    throw new ApiError(
      detail || `API ${response.status} for ${path}`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}
