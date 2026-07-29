import { BRAND } from '@/lib/constants/brand';
import { escapeHtml } from '@/lib/auth/html-escape';

export function buildWelcomeEmail({
  name,
}: {
  name: string;
}): { subject: string; html: string; text: string } {
  const safeName = name.trim();
  const greetingText = safeName ? `Hei ${safeName}!` : 'Hei!';
  const greetingHtml = safeName ? `Hei ${escapeHtml(safeName)}!` : 'Hei!';
  const subject = `Velkommen til ${BRAND.name}`;

  const text = [
    greetingText,
    ``,
    `E-postadressen din er bekreftet. Du kan nå logge inn og bruke kontoen din på ${BRAND.domain}.`,
    ``,
    `Prisvarsler aktiveres snart — vi gir deg beskjed når funksjonen er klar.`,
    ``,
    BRAND.siteUrl,
  ].join('\n');

  const html = `
    <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #1a1a1a;">
      <p>${greetingHtml}</p>
      <p>E-postadressen din er bekreftet. Du kan nå logge inn og bruke kontoen din på <strong>${escapeHtml(BRAND.domain)}</strong>.</p>
      <p>Prisvarsler aktiveres snart — vi gir deg beskjed når funksjonen er klar.</p>
      <p><a href="${escapeHtml(BRAND.siteUrl)}" style="color:#1a1a1a;">Gå til ${escapeHtml(BRAND.domain)}</a></p>
    </div>
  `.trim();

  return { subject, html, text };
}
