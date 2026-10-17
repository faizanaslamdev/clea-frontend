import type { FetchQueryOptions, QueryClient, QueryKey } from '@tanstack/react-query';

/**
 * Server-side prefetch with a time budget. If the data arrives within
 * `budgetMs` it is rendered into the page; otherwise the page renders without
 * it and the client hook fetches it behind its own skeleton. A slow secondary
 * section must never hold the whole page back.
 */
export async function prefetchWithin<TData, TKey extends QueryKey>(
  queryClient: QueryClient,
  options: FetchQueryOptions<TData, Error, TData, TKey>,
  budgetMs: number,
): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const budget = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, budgetMs);
  });
  try {
    await Promise.race([queryClient.prefetchQuery(options), budget]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
