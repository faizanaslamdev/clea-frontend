import { toNextJsHandler } from 'better-auth/next-js';
import { getAuth } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Lazily bind Better Auth handlers so `next build` can collect route data
 * without requiring auth secrets at module-evaluation time.
 */
function getHandlers() {
  return toNextJsHandler(getAuth());
}

export function GET(request: Request) {
  return getHandlers().GET(request);
}

export function POST(request: Request) {
  return getHandlers().POST(request);
}
