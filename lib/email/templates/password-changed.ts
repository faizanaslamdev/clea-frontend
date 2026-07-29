import { BRAND } from '@/lib/constants/brand';
import { COMPANY } from '@/lib/constants/company';
import { escapeHtml } from '@/lib/auth/html-escape';
import {
  renderTransactionalEmail,
  type EmailParts,
} from '@/lib/email/layout';

export function buildPasswordChangedEmail({
  name,
}: {
  name?: string | null;
}): EmailParts {
  const safeName = name?.trim() ?? '';
  const greetingText = safeName ? `Hei ${safeName}!` : 'Hei!';
  const greetingHtml = safeName
    ? `Hei ${escapeHtml(safeName)}!`
    : 'Hei!';

  return renderTransactionalEmail({
    subject: 'Passordet ditt er endret',
    preheader: 'Passordet til Clea-kontoen din ble nettopp endret.',
    heading: 'Passordet ditt er endret',
    bodyHtml: `
      <p style="margin:0 0 14px;">${greetingHtml}</p>
      <p style="margin:0 0 14px;">
        Passordet til Clea-kontoen din ble nettopp endret.
      </p>
      <p style="margin:0;">
        Hvis dette ikke var deg, ta kontakt på
        <a href="mailto:${escapeHtml(COMPANY.email)}" style="color:#111111;text-decoration:underline;">${escapeHtml(COMPANY.email)}</a>
        så raskt som mulig.
      </p>
    `,
    bodyText: [
      greetingText,
      '',
      'Passordet til Clea-kontoen din ble nettopp endret.',
      '',
      `Hvis dette ikke var deg, ta kontakt på ${COMPANY.email} så raskt som mulig.`,
      '',
      `${BRAND.siteUrl}/account`,
    ],
    cta: { href: `${BRAND.siteUrl}/account`, label: 'Gå til kontoen din' },
    reason: 'Du mottar denne e-posten fordi passordet til Clea-kontoen din ble endret.',
  });
}
