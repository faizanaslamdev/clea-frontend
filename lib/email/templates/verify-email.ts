import { BRAND } from '@/lib/constants/brand';
import { escapeHtml } from '@/lib/auth/html-escape';
import {
  AUTH_TOKEN_EXPIRES_IN_SECONDS,
  formatTokenExpiryCopy,
  renderTransactionalEmail,
  type EmailParts,
} from '@/lib/email/layout';
import { safeHttpUrl } from '@/lib/email/safe-url';

export type EmailLang = 'nb' | 'en';

const COPY = {
  nb: {
    subject: 'Bekreft e-postadressen din',
    preheader: 'Ett trykk, så er du i gang med Clea.',
    heading: 'Bekreft e-postadressen din',
    hello: 'Hei!',
    body: (brand: string) =>
      `Trykk på knappen under for å bekrefte e-postadressen din. Da kan du logge inn på ${brand}, lagre favoritter og få beskjed når prisen går ned.`,
    button: 'Bekreft e-post',
    fallback: 'Virker ikke knappen? Åpne denne lenken:',
    reason:
      'Du mottar denne e-posten fordi det ble opprettet eller forespurt en Clea-konto med denne adressen.',
    ignore: 'Hvis du ikke opprettet en konto, kan du ignorere denne e-posten.',
  },
  en: {
    subject: 'Confirm your e-mail address',
    preheader: 'One tap and you are ready to use Clea.',
    heading: 'Confirm your e-mail address',
    hello: 'Hi!',
    body: (brand: string) =>
      `Tap the button below to confirm your e-mail address. Then you can log in to ${brand}, save favourites and hear from us when a price drops.`,
    button: 'Confirm e-mail',
    fallback: 'Button not working? Open this link:',
    reason:
      'You are receiving this e-mail because a Clea account was created or requested with this address.',
    ignore: 'If you did not create an account, you can ignore this e-mail.',
  },
} as const;

/** The app adds `lang=en` to its callback URL when it runs in English. */
export function emailLangFromVerifyUrl(url: string): EmailLang {
  try {
    const callback = new URL(url).searchParams.get('callbackURL') ?? '';
    return /[?&]lang=en(&|$)/.test(callback) ? 'en' : 'nb';
  } catch {
    return 'nb';
  }
}

export function buildVerifyEmail({
  url,
  expiresInSeconds = AUTH_TOKEN_EXPIRES_IN_SECONDS,
  lang = 'nb',
}: {
  url: string;
  expiresInSeconds?: number;
  lang?: EmailLang;
}): EmailParts {
  const verifiedUrl = safeHttpUrl(url);
  if (!verifiedUrl) {
    throw new Error('Verification email requires a valid http(s) URL.');
  }

  const copy = COPY[lang];
  const expiryCopy = formatTokenExpiryCopy(expiresInSeconds, lang);
  const body = copy.body(BRAND.name);

  return renderTransactionalEmail({
    lang,
    subject: copy.subject,
    preheader: copy.preheader,
    heading: copy.heading,
    bodyHtml: `
      <p style="margin:0 0 14px;">${escapeHtml(copy.hello)}</p>
      <p style="margin:0 0 14px;">${escapeHtml(body)}</p>
      <p style="margin:0;color:#666666;">${escapeHtml(expiryCopy)}</p>
    `,
    bodyText: [copy.hello, '', body, '', expiryCopy, '', verifiedUrl, '', copy.ignore],
    cta: { href: verifiedUrl, label: copy.button },
    linkFallback: { href: verifiedUrl, intro: copy.fallback },
    reason: copy.reason,
    footerNote: copy.ignore,
  });
}
