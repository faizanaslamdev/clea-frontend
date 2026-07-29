'use client';

import { Bell, BellOff, Check } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [optimisticTracking, setOptimisticTracking] = useState<boolean | null>(
    null,
  );
  const [confirmation, setConfirmation] = useState<
    'added' | 'removed' | null
  >(null);
  const [requestPending, setRequestPending] = useState(false);
  const clickLockedRef = useRef(false);
  const confirmationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const isAuthed = Boolean(session?.user);
  const isVerified = Boolean(session?.user?.emailVerified);

  const trackQuery = useTrackByProduct(productId, isAuthed && isVerified);
  const createTrackMutation = useCreateTrack();
  const stopTrackMutation = useStopTrack(productId);

  const isTracking = Boolean(trackQuery.data?.tracking);
  const displayedTracking = optimisticTracking ?? isTracking;
  const activeTrackId = trackQuery.data?.track?.id;

  useEffect(
    () => () => {
      if (confirmationTimerRef.current) {
        clearTimeout(confirmationTimerRef.current);
      }
    },
    [],
  );

  const finishConfirmation = useCallback((message: string) => {
    setInfo(message);
    confirmationTimerRef.current = setTimeout(() => {
      setConfirmation(null);
      setInfo(null);
      confirmationTimerRef.current = null;
    }, 1800);
  }, []);

  const giveSuccessFeedback = useCallback(() => {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function'
    ) {
      navigator.vibrate(8);
    }
  }, []);

  const startTracking = useCallback(async () => {
    setError(null);
    setOptimisticTracking(true);
    setConfirmation('added');
    setInfo('Prisvarsel lagt til.');
    try {
      const track = await createTrackMutation.mutateAsync(productId);
      setOptimisticTracking(null);
      giveSuccessFeedback();
      finishConfirmation(
        track.alreadyTracking
          ? 'Du følger allerede prisen på dette produktet.'
          : 'Vi følger prisen. Du får e-post ved prisfall.',
      );
      clearPendingActionAfterSuccess();
      refreshPendingAction();
    } catch (err) {
      setOptimisticTracking(null);
      setConfirmation(null);
      setInfo(null);
      if (err instanceof ApiError && err.status === 403) {
        openAuthModal({ view: 'verify-email' });
        return;
      }
      setError('Kunne ikke starte prisvarsling. Prøv igjen.');
    }
  }, [
    clearPendingActionAfterSuccess,
    createTrackMutation,
    finishConfirmation,
    giveSuccessFeedback,
    openAuthModal,
    productId,
    refreshPendingAction,
  ]);

  async function handleClick() {
    if (clickLockedRef.current) return;
    clickLockedRef.current = true;
    if (confirmationTimerRef.current) {
      clearTimeout(confirmationTimerRef.current);
      confirmationTimerRef.current = null;
    }
    setConfirmation(null);
    setInfo(null);
    setError(null);

    try {
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

      if (displayedTracking && activeTrackId) {
        setRequestPending(true);
        setOptimisticTracking(false);
        setConfirmation('removed');
        setInfo('Prisvarsel fjernet.');
        try {
          await stopTrackMutation.mutateAsync(activeTrackId);
          setOptimisticTracking(null);
          giveSuccessFeedback();
          finishConfirmation('Prisvarsling er stoppet.');
        } catch {
          setOptimisticTracking(null);
          setConfirmation(null);
          setInfo(null);
          setError('Kunne ikke stoppe prisvarsling. Prøv igjen.');
        }
        return;
      }

      setRequestPending(true);
      await startTracking();
    } finally {
      setRequestPending(false);
      clickLockedRef.current = false;
    }
  }

  const busy =
    isSessionPending ||
    trackQuery.isLoading ||
    requestPending ||
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
        data-tracking={displayedTracking}
        data-confirmation={confirmation ?? undefined}
      >
        <span className="product-detail-modal__notify-icon" aria-hidden>
          <Bell
            className="product-detail-modal__notify-icon-item"
            data-visible={!displayedTracking && !confirmation}
            strokeWidth={1.5}
          />
          <BellOff
            className="product-detail-modal__notify-icon-item"
            data-visible={displayedTracking && !confirmation}
            strokeWidth={1.5}
          />
          <Check
            className="product-detail-modal__notify-icon-item"
            data-visible={Boolean(confirmation)}
            strokeWidth={1.5}
          />
        </span>
        <span className="product-detail-modal__notify-label">
          {confirmation === 'added'
            ? 'Prisvarsel lagt til'
            : confirmation === 'removed'
              ? 'Prisvarsel fjernet'
              : displayedTracking
                ? 'Stopp prisvarsling'
                : 'Varsle meg ved prisfall'}
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
