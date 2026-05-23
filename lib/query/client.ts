import { QueryClient } from '@tanstack/react-query';

export const STALE_TIME_DEFAULT_MS = 1000 * 60 * 5;
export const STALE_TIME_STATIC_MS = Infinity;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_DEFAULT_MS,
        retry: 1,
      },
    },
  });
}
