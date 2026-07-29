import { createTrack } from '@/lib/api/tracks';
import { consumePendingTrackAction } from '@/lib/auth/resume-pending-action';

/**
 * Phase 2A: consume a pending Notify Me action by creating a track via the API.
 * Clears pending storage only after a successful create.
 */
export async function resumePendingProductTrack(): Promise<{
  consumed: boolean;
  trackId: string | null;
}> {
  const result = await consumePendingTrackAction(async (action) => {
    await createTrack(action.productId);
  });

  return {
    consumed: result.consumed,
    trackId: result.action ? result.action.productId : null,
  };
}
