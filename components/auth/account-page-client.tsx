'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

  async function handleSignOut() {
    await signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <PageLayout mainClassName="section-container section-shell py-12 md:py-16">
      <div className="account-page mx-auto max-w-2xl">
        <header className="account-page__header">
          <p className="account-page__eyebrow">Konto</p>
          <h1 className="type-heading">Min konto</h1>
          <p className="type-subheading mt-3 text-muted-foreground">
            Administrer innlogging og prisvarsler.
          </p>
        </header>

        {!user.emailVerified ? <VerifyEmailBanner email={user.email} /> : null}

        <section className="account-page__card" aria-label="Kontoinformasjon">
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
              <dt>E-post bekreftet</dt>
              <dd>{user.emailVerified ? 'Ja' : 'Nei'}</dd>
            </div>
          </dl>
        </section>

        <section className="account-page__card" aria-label="Prisvarsler">
          <div className="account-tracks__header">
            <h2 className="account-page__section-title">Prisvarsler</h2>
            <Link href="/account/tracks" className="auth-form__link">
              Se alle
            </Link>
          </div>
          <TrackedProductsList />
        </section>

        <div className="account-page__actions">
          <Button type="button" variant="outline" onClick={handleSignOut}>
            Logg ut
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
