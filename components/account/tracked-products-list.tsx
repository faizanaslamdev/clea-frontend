'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BellOff,
  ExternalLink,
  ImageIcon,
  LoaderCircle,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';
import { useSession } from '@/lib/auth/client';
import { formatPrice } from '@/lib/domain/format';
import { useActiveTracks, useStopTrack } from '@/lib/hooks/useTracks';
import { Button } from '@/components/ui/button';

function TrackImage({ src, name }: { src: string | null; name: string }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="account-tracks__media">
      {src && !hasError ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, 144px"
          className="account-tracks__image"
          unoptimized
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="account-tracks__image-fallback" aria-label="Bilde mangler">
          <ImageIcon className="size-6" aria-hidden />
        </div>
      )}
    </div>
  );
}

function TracksSkeleton() {
  return (
    <div className="account-tracks__list" aria-label="Laster prisvarsler" aria-busy>
      {[0, 1].map((item) => (
        <div key={item} className="account-tracks__item account-tracks__skeleton">
          <div className="account-tracks__skeleton-media" />
          <div className="account-tracks__skeleton-copy">
            <span />
            <span />
            <span />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TrackedProductsList() {
  const { data: session, isPending: isSessionPending } = useSession();
  const verified = Boolean(session?.user?.emailVerified);
  const tracksQuery = useActiveTracks(Boolean(session?.user) && verified);
  const stopTrackMutation = useStopTrack();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  if (isSessionPending) {
    return <TracksSkeleton />;
  }

  if (!session?.user) {
    return (
      <p className="account-page__section-copy">
        Logg inn for å se fulgte produkter.
      </p>
    );
  }

  if (!verified) {
    return (
      <p className="account-page__section-copy">
        Bekreft e-postadressen din for å administrere prisvarsler.
      </p>
    );
  }

  if (tracksQuery.isLoading) {
    return <TracksSkeleton />;
  }

  if (tracksQuery.isError) {
    return (
      <div className="account-tracks__state" role="alert">
        <p className="account-tracks__state-title">Prisvarslene kunne ikke lastes</p>
        <p className="account-page__section-copy">
          Kontroller forbindelsen og prøv på nytt.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void tracksQuery.refetch()}
        >
          <RotateCcw aria-hidden />
          Prøv igjen
        </Button>
      </div>
    );
  }

  const tracks = tracksQuery.data ?? [];

  if (tracks.length === 0) {
    return (
      <div className="account-tracks__empty">
        <span className="account-tracks__empty-icon" aria-hidden>
          <ShoppingBag />
        </span>
        <h3>Ingen prisvarsler ennå</h3>
        <p>
          Finn et produkt du liker og velg «Varsle meg ved prisfall». Vi gir
          beskjed på e-post når prisen går ned.
        </p>
        <Button asChild>
          <Link href="/brands">Utforsk produkter</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {feedback ? (
        <p className="account-tracks__feedback" role="status" aria-live="polite">
          {feedback}
        </p>
      ) : null}
      {removeError ? (
        <p className="auth-form__error" role="alert" aria-live="assertive">
          {removeError}
        </p>
      ) : null}
      <ul className="account-tracks__list">
      {tracks.map((track) => {
        const product = track.product;
        const title = product?.name ?? 'Produkt';
        const brand = product?.brand;
        const image = product?.imageUrl;
        const current =
          product?.currentPrice != null
            ? formatPrice(product.currentPrice, product.currency)
            : null;
        const atTrack = formatPrice(track.priceAtTrack, track.currency);
        const priceDrop =
          product?.currentPrice != null
            ? Math.max(0, track.priceAtTrack - product.currentPrice)
            : 0;
        const isRemoving =
          stopTrackMutation.isPending &&
          stopTrackMutation.variables === track.id;

        async function handleRemove() {
          const confirmed = window.confirm(
            `Stoppe prisvarsling for «${title}»?`,
          );
          if (!confirmed) return;

          setFeedback(null);
          setRemoveError(null);
          try {
            await stopTrackMutation.mutateAsync(track.id);
            setFeedback(`Prisvarslingen for «${title}» er stoppet.`);
          } catch {
            setRemoveError(
              `Kunne ikke stoppe prisvarslingen for «${title}». Produktet er fortsatt i listen.`,
            );
          }
        }

        return (
          <li key={track.id} className="account-tracks__item">
            <TrackImage src={image ?? null} name={title} />
            <div className="account-tracks__meta">
              <div className="account-tracks__heading">
                <div>
                  {brand ? <p className="account-tracks__brand">{brand}</p> : null}
                  <h3 className="account-tracks__name">{title}</h3>
                </div>
                <span className="account-tracks__badge">Aktivt varsel</span>
              </div>
              <div className="account-tracks__price-row">
                <p>
                  <span>Nå</span>
                  <strong>{current ?? 'Pris utilgjengelig'}</strong>
                </p>
                <p>
                  <span>Ved start</span>
                  <s>{atTrack}</s>
                </p>
                {priceDrop > 0 ? (
                  <p className="account-tracks__saving">
                    <span>Prisfall</span>
                    <strong>−{formatPrice(priceDrop, track.currency)}</strong>
                  </p>
                ) : null}
              </div>
              {track.lastNotifiedPrice != null ? (
                <p className="account-tracks__notified">
                  Sist varslet:{' '}
                  {formatPrice(track.lastNotifiedPrice, track.currency)}
                  {track.lastNotifiedAt
                    ? ` · ${new Date(track.lastNotifiedAt).toLocaleDateString('nb-NO')}`
                    : ''}
                </p>
              ) : (
                <p className="account-tracks__hint">
                  Du får e-post når prisen faller.
                </p>
              )}
              {product?.merchantName ? (
                <p className="account-tracks__merchant">
                  Selges av {product.merchantName}
                </p>
              ) : null}
              <p className="account-tracks__date">
                Fulgt siden{' '}
                {new Date(track.createdAt).toLocaleDateString('nb-NO', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <div className="account-tracks__actions">
                {product?.deepLink ? (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={product.deepLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Se produkt
                      <ExternalLink aria-hidden />
                    </a>
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isRemoving}
                  aria-busy={isRemoving}
                  onClick={() => void handleRemove()}
                >
                  {isRemoving ? (
                    <LoaderCircle className="animate-spin" aria-hidden />
                  ) : (
                    <BellOff aria-hidden />
                  )}
                  {isRemoving ? 'Stopper…' : 'Stopp varsel'}
                </Button>
              </div>
            </div>
          </li>
        );
      })}
      </ul>
    </>
  );
}
