import { BRAND } from '@/lib/constants/brand';
import { escapeHtml } from '@/lib/auth/html-escape';

export function buildVerifyEmail({
  url,
}: {
  url: string;
}): { subject: string; html: string; text: string } {
  const subject = `Bekreft e-postadressen din på ${BRAND.name}`;
  const safeUrl = escapeHtml(url);

  const text = [
    `Hei!`,
    ``,
    `Bekreft e-postadressen din for å bruke prisvarsler på ${BRAND.domain}.`,
    ``,
    url,
    ``,
    `Hvis du ikke opprettet en konto, kan du ignorere denne e-posten.`,
  ].join('\n');

  const html = `
    <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #1a1a1a;">
      <p>Hei!</p>
      <p>Bekreft e-postadressen din for å bruke prisvarsler på <strong>${escapeHtml(BRAND.domain)}</strong>.</p>
      <p><a href="${safeUrl}" style="display:inline-block;padding:12px 20px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:8px;">Bekreft e-post</a></p>
      <p style="font-size:14px;color:#666;">Hvis knappen ikke virker, lim inn denne lenken i nettleseren:<br><a href="${safeUrl}">${safeUrl}</a></p>
      <p style="font-size:14px;color:#666;">Hvis du ikke opprettet en konto, kan du ignorere denne e-posten.</p>
    </div>
  `.trim();

  return { subject, html, text };
}
