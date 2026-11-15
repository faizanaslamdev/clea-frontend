import type { Metadata } from 'next';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/page-layout';

export const metadata: Metadata = {
  title: 'E-post bekreftet',
  robots: { index: false, follow: false },
};

type Lang = 'nb' | 'en';

const COPY = {
  nb: {
    eyebrow: 'Konto',
    okTitle: 'E-posten din er bekreftet',
    okApp: 'Alt klart. Gå tilbake til Clea-appen, så er du logget inn.',
    okWeb: 'Alt klart. Du kan nå lagre favoritter og få prisvarsler.',
    openApp: 'Åpne Clea-appen',
    appHint: 'Åpner ikke appen seg? Bytt til Clea-appen selv og trykk «Logg inn».',
    continueWeb: 'Fortsett på clea.no',
    failTitle: 'Lenken virker ikke lenger',
    failApp: 'Lenken er brukt eller utløpt. Åpne Clea-appen og trykk «Send på nytt» for å få en ny.',
    failWeb: 'Lenken er brukt eller utløpt. Logg inn for å få tilsendt en ny.',
  },
  en: {
    eyebrow: 'Account',
    okTitle: 'Your e-mail is confirmed',
    okApp: 'All set. Go back to the Clea app and you are logged in.',
    okWeb: 'All set. You can now save favourites and get price alerts.',
    openApp: 'Open the Clea app',
    appHint: 'App did not open? Switch to the Clea app yourself and tap “Log in”.',
    continueWeb: 'Continue on clea.no',
    failTitle: 'This link no longer works',
    failApp: 'The link was used or has expired. Open the Clea app and tap “Send again” to get a new one.',
    failWeb: 'The link was used or has expired. Log in to get a new one.',
  },
} as const;

/**
 * Where the verification link lands. People who signed up in the app used to
 * end on the website's account page with no hint that they should go back to
 * the app; this page says so and offers a button that opens it.
 */
export default async function VerifiedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const lang: Lang = params.lang === 'en' ? 'en' : 'nb';
  const fromApp = params.source === 'app';
  const failed = typeof params.error === 'string' && params.error.length > 0;
  const copy = COPY[lang];

  return (
    <PageLayout mainClassName="section-container py-12 md:py-16">
      <div className="account-page mx-auto max-w-lg" lang={lang}>
        <header className="account-page__header">
          <p className="account-page__eyebrow">{copy.eyebrow}</p>
          <h1 className="type-heading">
            {failed ? copy.failTitle : copy.okTitle}
          </h1>
          <p className="type-subheading mt-3 text-muted-foreground">
            {failed
              ? fromApp
                ? copy.failApp
                : copy.failWeb
              : fromApp
                ? copy.okApp
                : copy.okWeb}
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-3">
          {fromApp ? (
            <a
              href={failed ? 'clea://profil' : 'clea://verified'}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-foreground px-6 text-base font-semibold text-background"
            >
              {copy.openApp}
            </a>
          ) : null}
          <Link
            href={failed ? '/' : '/account'}
            className={
              fromApp
                ? 'inline-flex min-h-12 items-center justify-center rounded-full px-6 text-base font-medium underline-offset-4 hover:underline'
                : 'inline-flex min-h-12 items-center justify-center rounded-full bg-foreground px-6 text-base font-semibold text-background'
            }
          >
            {copy.continueWeb}
          </Link>
          {fromApp && !failed ? (
            <p className="text-sm text-muted-foreground">{copy.appHint}</p>
          ) : null}
        </div>
      </div>
    </PageLayout>
  );
}
