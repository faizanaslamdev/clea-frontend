'use client';

import { Bell, BellOff, Check } from 'lucide-react';
import { useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthModal } from '@/components/auth/auth-provider';
import { useSession } from '@/lib/auth/client';
import { ApiError } from '@/lib/api/backend-client';
import { isValidProductId } from '@/lib/auth/pending-action';
import { sanitizeSafeReturnTo } from '@/lib/auth/return-to';
import {
  useCreateTrack,
  useStopTrack,
  useTrackByProduct,
} from '@/lib/hooks/useTracks';

interface NotifyMeButtonProps {
  productId: string;
  className?: string;
}

export function NotifyMeButton({ productId, className }: NotifyMeButtonProps) {
  const { data: session, isPending: isSessionPending } = useSession();
  const { openAuthModal, clearPendingActionAfterSuccess, refreshPendingAction } =
    useAuthModal();
  const pathname = usePathname();
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAuthed = Boolean(session?.user);
  const isVerified = Boolean(session?.user?.emailVerified);

  const trackQuery = useTrackByProduct(productId, isAuthed && isVerified);
  const createTrackMutation = useCreateTrack();
  const stopTrackMutation = useStopTrack();

  const isTracking = Boolean(trackQuery.data?.tracking && trackQuery.data.track);
  const activeTrackId = trackQuery.data?.track?.id;

  const startTracking = useCallback(async () => {
    setError(null);
    try {
      const track = await createTrackMutation.mutateAsync(productId);
      setInfo(
        track.alreadyTracking
          ? 'Du følger allerede prisen på dette produktet.'
          : 'Vi følger prisen. Du får e-post ved prisfall.',
      );
      clearPendingActionAfterSuccess();
      refreshPendingAction();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        openAuthModal({ view: 'verify-email' });
        return;
      }
      setError('Kunne ikke starte prisvarsling. Prøv igjen.');
    }
  }, [
    clearPendingActionAfterSuccess,
    createTrackMutation,
    openAuthModal,
    productId,
    refreshPendingAction,
  ]);

  async function handleClick() {
    setInfo(null);
    setError(null);

    if (!isValidProductId(productId)) {
      setError('Kunne ikke starte prisvarsling for dette produktet.');
      return;
    }

    const returnTo = sanitizeSafeReturnTo(pathname, '/account/tracks');
    const pending = {
      type: 'track' as const,
      productId,
      returnTo,
    };

    if (!session) {
      openAuthModal({
        view: 'sign-in',
        pendingAction: pending,
      });
      return;
    }

    if (!session.user.emailVerified) {
      openAuthModal({
        view: 'verify-email',
        pendingAction: pending,
      });
      return;
    }

    if (isTracking && activeTrackId) {
      try {
        await stopTrackMutation.mutateAsync(activeTrackId);
        setInfo('Prisvarsling er stoppet.');
      } catch {
        setError('Kunne ikke stoppe prisvarsling. Prøv igjen.');
      }
      return;
    }

    await startTracking();
  }

  const busy =
    isSessionPending ||
    trackQuery.isLoading ||
    createTrackMutation.isPending ||
    stopTrackMutation.isPending;

  return (
    <div className={className}>
      <button
        type="button"
        className="product-detail-modal__notify-btn"
        onClick={() => void handleClick()}
        disabled={busy}
        aria-busy={busy}
      >
        {isTracking ? (
          <BellOff className="size-4.5" strokeWidth={1.5} aria-hidden />
        ) : info && !error ? (
          <Check className="size-4.5" strokeWidth={1.5} aria-hidden />
        ) : (
          <Bell className="size-4.5" strokeWidth={1.5} aria-hidden />
        )}
        <span>
          {isTracking ? 'Stopp prisvarsling' : 'Varsle meg ved prisfall'}
        </span>
      </button>
      {info ? (
        <p
          className="product-detail-modal__notify-info"
          role="status"
          aria-live="polite"
        >
          {info}
        </p>
      ) : null}
      {error ? (
        <p
          className="product-detail-modal__notify-error"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
