import {
  buildPendingActionResumeMessage,
  clearPendingAction,
  readPendingAction,
  type AuthPendingAction,
  type AuthPendingTrackAction,
} from '@/lib/auth/pending-action';

export interface AuthSessionLike {
  user?: {
    id?: string;
    emailVerified?: boolean;
  } | null;
}

export interface PendingTrackResumeState {
  pendingAction: AuthPendingTrackAction | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  /** True when Phase 2 may safely consume the pending track action. */
  isReadyToResume: boolean;
  placeholderMessage: string | null;
}

export function getPendingTrackResumeState(
  session: AuthSessionLike | null | undefined,
  pendingAction: AuthPendingAction | null = readPendingAction(),
): PendingTrackResumeState {
  const trackAction =
    pendingAction?.type === 'track' ? pendingAction : null;
  const isAuthenticated = Boolean(session?.user?.id);
  const isEmailVerified = Boolean(session?.user?.emailVerified);
  const isReadyToResume = Boolean(
    trackAction && isAuthenticated && isEmailVerified,
  );

  return {
    pendingAction: trackAction,
    isAuthenticated,
    isEmailVerified,
    isReadyToResume,
    placeholderMessage: isReadyToResume
      ? buildPendingActionResumeMessage(trackAction!)
      : null,
  };
}

export type TrackPendingActionHandler = (
  action: AuthPendingTrackAction,
) => Promise<void> | void;

/**
 * Phase 2 entry point: run tracking for the stored Notify Me action.
 * Clears storage only after the handler resolves successfully.
 * On failure, the pending action is preserved for retry.
 */
export async function consumePendingTrackAction(
  handler: TrackPendingActionHandler,
): Promise<{ consumed: boolean; action: AuthPendingTrackAction | null }> {
  const action = readPendingAction();
  if (!action || action.type !== 'track') {
    return { consumed: false, action: null };
  }

  await handler(action);
  clearPendingAction();
  return { consumed: true, action };
}

/** Explicit user cancel — safe to clear without tracking. */
export function cancelPendingTrackAction(): void {
  clearPendingAction();
}
