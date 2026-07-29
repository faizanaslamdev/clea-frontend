/**
 * Allows only same-origin relative paths for post-auth redirects.
 * Rejects absolute URLs, protocol-relative URLs, javascript:, data:, etc.
 */
export function sanitizeSafeReturnTo(
  value: string | null | undefined,
  fallback = '/account',
): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith('/')) {
    return fallback;
  }

  // Protocol-relative or accidental scheme smuggling
  if (
    trimmed.startsWith('//') ||
    trimmed.includes('://') ||
    trimmed.toLowerCase().startsWith('/\\') ||
    /[\u0000-\u001F\u007F]/.test(trimmed)
  ) {
    return fallback;
  }

  // Block encoded tricks that resolve outside the app
  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    return fallback;
  }

  if (
    !decoded.startsWith('/') ||
    decoded.startsWith('//') ||
    decoded.includes('://') ||
    /^\/[a-z][a-z0-9+.-]*:/i.test(decoded)
  ) {
    return fallback;
  }

  // Keep path + query only; drop hash for simplicity
  const pathAndQuery = decoded.split('#')[0] ?? decoded;
  if (!pathAndQuery.startsWith('/') || pathAndQuery.startsWith('//')) {
    return fallback;
  }

  return pathAndQuery;
}

export const AUTH_RETURN_TO_KEY = 'clea.auth.returnTo';

export function saveReturnTo(returnTo: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.setItem(
    AUTH_RETURN_TO_KEY,
    sanitizeSafeReturnTo(returnTo, '/account'),
  );
}

export function readReturnTo(fallback = '/account'): string {
  if (typeof window === 'undefined') {
    return fallback;
  }

  return sanitizeSafeReturnTo(
    sessionStorage.getItem(AUTH_RETURN_TO_KEY),
    fallback,
  );
}

export function clearReturnTo(): void {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(AUTH_RETURN_TO_KEY);
}

export function resolvePostAuthReturnTo(options?: {
  pendingReturnTo?: string | null;
  queryReturnTo?: string | null;
  fallback?: string;
}): string {
  const fallback = options?.fallback ?? '/account';

  return sanitizeSafeReturnTo(
    options?.pendingReturnTo ??
      (typeof window !== 'undefined'
        ? sessionStorage.getItem(AUTH_RETURN_TO_KEY)
        : null) ??
      options?.queryReturnTo,
    fallback,
  );
}
