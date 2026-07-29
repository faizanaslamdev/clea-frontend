import { BRAND } from '@/lib/constants/brand';
import { escapeHtml } from '@/lib/auth/html-escape';
import {
  AUTH_TOKEN_EXPIRES_IN_SECONDS,
  formatTokenExpiryCopy,
  renderTransactionalEmail,
  type EmailParts,
} from '@/lib/email/layout';
import { safeHttpUrl } from '@/lib/email/safe-url';

export function buildResetPasswordEmail({
  url,
  expiresInSeconds = AUTH_TOKEN_EXPIRES_IN_SECONDS,
}: {
  url: string;
  expiresInSeconds?: number;
}): EmailParts {
  const verifiedUrl = safeHttpUrl(url);
  if (!verifiedUrl) {
    throw new Error('Password reset email requires a valid http(s) URL.');
  }

  const safeUrl = escapeHtml(verifiedUrl);
  const expiryCopy = formatTokenExpiryCopy(expiresInSeconds);

  return renderTransactionalEmail({
    subject: 'Tilbakestill passordet ditt',
    preheader: 'Bruk den sikre lenken innen én time.',
    heading: 'Tilbakestill passordet ditt',
    bodyHtml: `
      <p style="margin:0 0 14px;">Hei!</p>
      <p style="margin:0 0 14px;">
        Vi mottok en forespørsel om å tilbakestille passordet ditt på ${escapeHtml(BRAND.name)}.
      </p>
      <p style="margin:0 0 14px;">${escapeHtml(expiryCopy)}</p>
      <p style="margin:0 0 14px;">
        Passordet ditt forblir uendret hvis du ikke gjør noe.
      </p>
      <p style="margin:0;font-size:13px;color:#666666;">
        Hvis knappen ikke virker, lim inn denne lenken i nettleseren:<br />
        <a href="${safeUrl}" style="color:#111111;word-break:break-all;">${safeUrl}</a>
      </p>
    `,
    bodyText: [
      'Hei!',
      '',
      `Vi mottok en forespørsel om å tilbakestille passordet ditt på ${BRAND.name}.`,
      '',
      expiryCopy,
      '',
      'Passordet ditt forblir uendret hvis du ikke gjør noe.',
      '',
      verifiedUrl,
      '',
      'Hvis du ikke ba om dette, kan du ignorere denne e-posten.',
    ],
    cta: { href: verifiedUrl, label: 'Tilbakestill passord' },
    reason:
      'Du mottar denne e-posten fordi noen ba om å tilbakestille passordet for denne adressen.',
    footerNote:
      'Hvis du ikke ba om dette, kan du trygt ignorere e-posten. Passordet forblir uendret.',
  });
}
