import { BRAND } from '@/lib/constants/brand';
import { escapeHtml } from '@/lib/auth/html-escape';
import {
  renderTransactionalEmail,
  type EmailParts,
} from '@/lib/email/layout';

export function buildWelcomeEmail({
  name,
}: {
  name?: string | null;
}): EmailParts {
  const safeName = name?.trim() ?? '';
  const greetingText = safeName ? `Hei ${safeName}!` : 'Hei!';
  const greetingHtml = safeName
    ? `Hei ${escapeHtml(safeName)}!`
    : 'Hei!';
  const accountUrl = `${BRAND.siteUrl}/account`;

  return renderTransactionalEmail({
    subject: 'E-postadressen din er bekreftet',
    preheader: 'Du kan nå følge produkter og få beskjed ved prisfall.',
    heading: 'E-postadressen din er bekreftet',
    bodyHtml: `
      <p style="margin:0 0 14px;">${greetingHtml}</p>
      <p style="margin:0 0 14px;">
        E-postadressen din er bekreftet. Du kan nå logge inn på Clea, utforske produkter,
        følge favorittene dine og få e-post når prisen faller.
      </p>
      <p style="margin:0;">
        Du administrerer prisvarsler når som helst fra kontoen din.
      </p>
    `,
    bodyText: [
      greetingText,
      '',
      'E-postadressen din er bekreftet. Du kan nå logge inn på Clea, utforske produkter, følge favorittene dine og få e-post når prisen faller.',
      '',
      'Du administrerer prisvarsler når som helst fra kontoen din.',
      '',
      accountUrl,
    ],
    cta: { href: accountUrl, label: 'Gå til kontoen din' },
    secondaryLinks: [{ href: BRAND.siteUrl, label: 'Utforsk Clea' }],
    reason: 'Du mottar denne e-posten fordi du nettopp bekreftet e-postadressen din på Clea.',
  });
}
