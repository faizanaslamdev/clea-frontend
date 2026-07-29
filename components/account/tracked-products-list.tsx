'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSession } from '@/lib/auth/client';
import { formatPrice } from '@/lib/domain/format';
import { useActiveTracks, useStopTrack } from '@/lib/hooks/useTracks';
import { Button } from '@/components/ui/button';

export function TrackedProductsList() {
  const { data: session, isPending: isSessionPending } = useSession();
  const verified = Boolean(session?.user?.emailVerified);
  const tracksQuery = useActiveTracks(Boolean(session?.user) && verified);
  const stopTrackMutation = useStopTrack();

  if (isSessionPending) {
    return <p className="account-page__section-copy">Laster…</p>;
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
    return <p className="account-page__section-copy">Laster prisvarsler…</p>;
  }

  if (tracksQuery.isError) {
    return (
      <p className="auth-form__error" role="alert">
        Kunne ikke hente prisvarsler. Prøv igjen senere.
      </p>
    );
  }

  const tracks = tracksQuery.data ?? [];

  if (tracks.length === 0) {
    return (
      <div className="account-tracks__empty">
        <p className="account-page__section-copy">
          Du følger ingen produkter ennå.
        </p>
        <Link href="/brands" className="auth-form__link">
          Utforsk merker
        </Link>
      </div>
    );
  }

  return (
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

        return (
          <li key={track.id} className="account-tracks__item">
            <div className="account-tracks__media">
              {image ? (
                <Image
                  src={image}
                  alt=""
                  width={72}
                  height={96}
                  className="account-tracks__image"
                  unoptimized
                />
              ) : (
                <div className="account-tracks__image-fallback" aria-hidden />
              )}
            </div>
            <div className="account-tracks__meta">
              {brand ? <p className="account-tracks__brand">{brand}</p> : null}
              <p className="account-tracks__name">{title}</p>
              <p className="account-tracks__prices">
                Ved start: {atTrack}
                {current ? ` · Nå: ${current}` : ''}
              </p>
              {track.lastNotifiedPrice != null ? (
                <p className="account-tracks__prices account-tracks__notified">
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
                <p className="account-tracks__merchant">{product.merchantName}</p>
              ) : null}
              <p className="account-tracks__status">
                Status: {track.status === 'active' ? 'Aktiv' : track.status}
              </p>
            </div>
            <div className="account-tracks__actions">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={stopTrackMutation.isPending}
                onClick={() => void stopTrackMutation.mutateAsync(track.id)}
              >
                Stopp
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
