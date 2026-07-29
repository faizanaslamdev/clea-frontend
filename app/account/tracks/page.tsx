import type { Metadata } from 'next';
import Link from 'next/link';
import { TrackedProductsList } from '@/components/account/tracked-products-list';
import { PageLayout } from '@/components/layout/page-layout';

export const metadata: Metadata = {
  title: 'Prisvarsler',
  robots: { index: false, follow: false },
};

export default function AccountTracksPage() {
  return (
    <PageLayout mainClassName="section-container section-shell py-12 md:py-16">
      <div className="account-page mx-auto max-w-2xl">
        <header className="account-page__header">
          <p className="account-page__eyebrow">Konto</p>
          <h1 className="type-heading">Prisvarsler</h1>
          <p className="type-subheading mt-3 text-muted-foreground">
            Produkter du følger. Vi varsler deg på e-post når prisen faller.
          </p>
        </header>

        <section className="account-page__card" aria-label="Fulgte produkter">
          <TrackedProductsList />
        </section>

        <p className="mt-6">
          <Link href="/account" className="auth-form__link">
            Tilbake til konto
          </Link>
        </p>
      </div>
    </PageLayout>
  );
}
