import { BRAND } from '@/lib/constants/brand';
import { escapeHtml } from '@/lib/auth/html-escape';
import {
  AUTH_TOKEN_EXPIRES_IN_SECONDS,
  formatTokenExpiryCopy,
  renderTransactionalEmail,
  type EmailParts,
} from '@/lib/email/layout';
import { safeHttpUrl } from '@/lib/email/safe-url';

export function buildVerifyEmail({
  url,
  expiresInSeconds = AUTH_TOKEN_EXPIRES_IN_SECONDS,
}: {
  url: string;
  expiresInSeconds?: number;
}): EmailParts {
  const verifiedUrl = safeHttpUrl(url);
  if (!verifiedUrl) {
    throw new Error('Verification email requires a valid http(s) URL.');
  }

  const safeUrl = escapeHtml(verifiedUrl);
  const expiryCopy = formatTokenExpiryCopy(expiresInSeconds);

  return renderTransactionalEmail({
    subject: 'Bekreft e-postadressen din',
    preheader: 'Bekreft e-postadressen din for å komme i gang med Clea.',
    heading: 'Bekreft e-postadressen din',
    bodyHtml: `
      <p style="margin:0 0 14px;">Hei!</p>
      <p style="margin:0 0 14px;">
        Bekreft e-postadressen din for å logge inn på ${escapeHtml(BRAND.name)}, følge produkter
        og få e-post når prisene går ned.
      </p>
      <p style="margin:0 0 14px;">${escapeHtml(expiryCopy)}</p>
      <p style="margin:0;font-size:13px;color:#666666;">
        Hvis knappen ikke virker, lim inn denne lenken i nettleseren:<br />
        <a href="${safeUrl}" style="color:#111111;word-break:break-all;">${safeUrl}</a>
      </p>
    `,
    bodyText: [
      'Hei!',
      '',
      `Bekreft e-postadressen din for å logge inn på ${BRAND.name}, følge produkter og få e-post når prisene går ned.`,
      '',
      expiryCopy,
      '',
      verifiedUrl,
      '',
      'Hvis du ikke opprettet en konto, kan du ignorere denne e-posten.',
    ],
    cta: { href: verifiedUrl, label: 'Bekreft e-post' },
    reason:
      'Du mottar denne e-posten fordi det ble opprettet eller forespurt en Clea-konto med denne adressen.',
    footerNote: 'Hvis du ikke opprettet en konto, kan du ignorere denne e-posten.',
  });
}
