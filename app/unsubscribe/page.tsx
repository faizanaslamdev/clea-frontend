import type { Metadata } from 'next';
import { Suspense } from 'react';
import { UnsubscribeForm } from '@/components/account/unsubscribe-form';
import { PageLayout } from '@/components/layout/page-layout';

export const metadata: Metadata = {
  title: 'Stopp varsling',
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <PageLayout mainClassName="section-container section-shell py-12 md:py-16">
      <div className="account-page mx-auto max-w-lg">
        <header className="account-page__header">
          <p className="account-page__eyebrow">Prisvarsler</p>
          <h1 className="type-heading">Stopp varsling</h1>
          <p className="type-subheading mt-3 text-muted-foreground">
            Du trenger ikke være innlogget for å stoppe varsler for ett produkt.
          </p>
        </header>

        <section className="account-page__card" aria-label="Stopp varsling">
          <Suspense
            fallback={<p className="account-page__section-copy">Laster…</p>}
          >
            <UnsubscribeForm />
          </Suspense>
        </section>
      </div>
    </PageLayout>
  );
}
