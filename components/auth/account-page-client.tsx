'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, LoaderCircle, LogOut, UserRound } from 'lucide-react';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { VerifyEmailBanner } from '@/components/auth/verify-email-banner';
import { TrackedProductsList } from '@/components/account/tracked-products-list';
import { signOut } from '@/lib/auth/client';

interface AccountUser {
  name: string;
  email: string;
  emailVerified: boolean;
}

interface AccountPageClientProps {
  user: AccountUser;
}

export function AccountPageClient({ user }: AccountPageClientProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <PageLayout mainClassName="section-container section-shell py-12 md:py-16">
      <div className="account-page mx-auto max-w-5xl">
        <header className="account-page__header">
          <div>
            <p className="account-page__eyebrow">Konto</p>
            <h1 className="type-heading">
              {user.name ? `Hei, ${user.name}` : 'Min konto'}
            </h1>
            <p className="type-subheading mt-3 text-muted-foreground">
              {user.email}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={isSigningOut}
            aria-busy={isSigningOut}
            onClick={() => void handleSignOut()}
          >
            {isSigningOut ? (
              <LoaderCircle className="animate-spin" aria-hidden />
            ) : (
              <LogOut aria-hidden />
            )}
            {isSigningOut ? 'Logger ut…' : 'Logg ut'}
          </Button>
        </header>

        <nav className="account-page__nav" aria-label="Kontoseksjoner">
          <Link href="#profile">
            <UserRound aria-hidden />
            Kontoinformasjon
          </Link>
          <Link href="#price-alerts">
            <Bell aria-hidden />
            Prisvarsler
          </Link>
        </nav>

        {!user.emailVerified ? <VerifyEmailBanner email={user.email} /> : null}

        <section
          id="profile"
          className="account-page__card account-page__profile"
          aria-labelledby="profile-title"
        >
          <div className="account-page__section-header">
            <span className="account-page__section-icon" aria-hidden>
              <UserRound />
            </span>
            <div>
              <h2 id="profile-title" className="account-page__section-title">
                Kontoinformasjon
              </h2>
              <p>Opplysningene knyttet til Clea-kontoen din.</p>
            </div>
          </div>
          <dl className="account-page__details">
            <div>
              <dt>Navn</dt>
              <dd>{user.name || '—'}</dd>
            </div>
            <div>
              <dt>E-post</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span
                  className={
                    user.emailVerified
                      ? 'account-page__verified'
                      : 'account-page__unverified'
                  }
                >
                  {user.emailVerified
                    ? 'E-post bekreftet'
                    : 'Venter på bekreftelse'}
                </span>
              </dd>
            </div>
          </dl>
        </section>

        <section
          id="price-alerts"
          className="account-page__card"
          aria-labelledby="price-alerts-title"
        >
          <div className="account-page__section-header">
            <span className="account-page__section-icon" aria-hidden>
              <Bell />
            </span>
            <div>
              <h2 id="price-alerts-title" className="account-page__section-title">
                Prisvarsler
              </h2>
              <p>
                Produkter du følger. Vi sender e-post når prisen går ned.
              </p>
            </div>
          </div>
          <TrackedProductsList />
        </section>
      </div>
    </PageLayout>
  );
}
