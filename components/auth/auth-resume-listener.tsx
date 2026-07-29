'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthModal } from '@/components/auth/auth-provider';
import { useSession } from '@/lib/auth/client';
import {
  clearReturnTo,
  resolvePostAuthReturnTo,
} from '@/lib/auth/return-to';
import { getPendingTrackResumeState } from '@/lib/auth/resume-pending-action';
import { resumePendingProductTrack } from '@/lib/auth/resume-track';
import { trackQueryKeys } from '@/lib/hooks/useTracks';

/**
 * After auth + email verification, resume any pending Notify Me action
 * by creating a track, then navigate to a safe returnTo.
 */
export function AuthResumeListener() {
  const { data: session } = useSession();
  const {
    pendingAction,
    refreshPendingAction,
    clearPendingActionAfterSuccess,
  } = useAuthModal();
  const router = useRouter();
  const queryClient = useQueryClient();
  const didResumeRef = useRef(false);

  useEffect(() => {
    refreshPendingAction();
  }, [session?.user?.id, session?.user?.emailVerified, refreshPendingAction]);

  useEffect(() => {
    const resume = getPendingTrackResumeState(session, pendingAction);
    if (!resume.isReadyToResume || didResumeRef.current) {
      return;
    }

    didResumeRef.current = true;

    void (async () => {
      try {
        const result = await resumePendingProductTrack();
        if (result.consumed) {
          clearPendingActionAfterSuccess();
          refreshPendingAction();
          await queryClient.invalidateQueries({ queryKey: trackQueryKeys.all });
        }
      } catch {
        // Keep pending action for retry via Notify Me button.
        didResumeRef.current = false;
        return;
      }

      const returnTo = resolvePostAuthReturnTo({
        pendingReturnTo: resume.pendingAction?.returnTo,
        fallback: '/account/tracks',
      });
      clearReturnTo();
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== returnTo.split('?')[0]
      ) {
        router.replace(returnTo);
      }
    })();
  }, [
    clearPendingActionAfterSuccess,
    pendingAction,
    queryClient,
    refreshPendingAction,
    router,
    session,
  ]);

  return null;
}
