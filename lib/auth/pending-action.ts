import { sanitizeSafeReturnTo } from '@/lib/auth/return-to';

export type AuthPendingTrackAction = {
  type: 'track';
  productId: string;
  returnTo?: string;
  createdAt: string;
};

export type AuthPendingAction = AuthPendingTrackAction;

export const AUTH_PENDING_ACTION_KEY = 'clea.auth.pendingAction';

/** CLEA product ids are UUID values from Postgres. */
const PRODUCT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidProductId(productId: unknown): productId is string {
  return typeof productId === 'string' && PRODUCT_ID_PATTERN.test(productId);
}

export function parsePendingAction(raw: unknown): AuthPendingAction | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const candidate = raw as Partial<AuthPendingTrackAction>;
  if (candidate.type !== 'track' || !isValidProductId(candidate.productId)) {
    return null;
  }

  const action: AuthPendingTrackAction = {
    type: 'track',
    productId: candidate.productId,
    createdAt:
      typeof candidate.createdAt === 'string' && candidate.createdAt
        ? candidate.createdAt
        : new Date(0).toISOString(),
  };

  if (typeof candidate.returnTo === 'string' && candidate.returnTo.trim()) {
    action.returnTo = sanitizeSafeReturnTo(candidate.returnTo, '/account');
  }

  return action;
}

export function savePendingAction(
  action: Omit<AuthPendingTrackAction, 'createdAt'> & { createdAt?: string },
): AuthPendingAction | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const normalized = parsePendingAction({
    ...action,
    createdAt: action.createdAt ?? new Date().toISOString(),
  });

  if (!normalized) {
    return null;
  }

  sessionStorage.setItem(AUTH_PENDING_ACTION_KEY, JSON.stringify(normalized));
  return normalized;
}

export function readPendingAction(): AuthPendingAction | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = sessionStorage.getItem(AUTH_PENDING_ACTION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = parsePendingAction(JSON.parse(raw) as unknown);
    if (!parsed) {
      sessionStorage.removeItem(AUTH_PENDING_ACTION_KEY);
      return null;
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(AUTH_PENDING_ACTION_KEY);
    return null;
  }
}

/**
 * Clears the pending action.
 * Call only after Phase 2 tracking succeeds, or when the user explicitly cancels.
 */
export function clearPendingAction(): void {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(AUTH_PENDING_ACTION_KEY);
}

export function buildPendingActionResumeMessage(
  action: AuthPendingAction,
): string {
  if (action.type === 'track') {
    return 'Du er innlogget. Starter prisvarsling…';
  }

  return 'Du er innlogget.';
}
