import type { QueryClient, QueryKey } from '@tanstack/react-query';

/**
 * Throwing only helps where a previous page exists to fall back to: a
 * production server revalidating an ISR page. During `next build` and in
 * `next dev` there is none, so there we log and render what we have.
 */
export function canKeepPreviousPage(): boolean {
  return (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PHASE !== 'phase-production-build'
  );
}

/**
 * Call after an ISR page's prefetches. If any essential query failed (API
 * error or timeout), throw during a background revalidation so Vercel keeps
 * serving the last good page instead of caching an empty one — and sending
 * every visitor's browser off to refetch it all.
 */
export function requirePrefetched(
  queryClient: QueryClient,
  page: string,
  keys: readonly QueryKey[],
): void {
  const missing = keys.filter(
    (key) => queryClient.getQueryState(key)?.status !== 'success',
  );
  if (missing.length === 0) return;

  const message = `ISR ${page}: essential data missing (${missing
    .map((key) => JSON.stringify(key))
    .join(', ')})`;
  if (!canKeepPreviousPage()) {
    console.warn(`${message}; rendering without it`);
    return;
  }
  throw new Error(`${message}; keeping the previous page`);
}
