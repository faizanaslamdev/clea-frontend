import { BRAND } from '@/lib/constants/brand';
import { COMPANY } from '@/lib/constants/company';
import { escapeHtml } from '@/lib/auth/html-escape';
import { safeHttpUrl, sanitizeSubject } from '@/lib/email/safe-url';

export const AUTH_TOKEN_EXPIRES_IN_SECONDS = 60 * 60;

export interface EmailParts {
  subject: string;
  preheader: string;
  html: string;
  text: string;
}

export interface LayoutOptions {
  subject: string;
  preheader: string;
  heading: string;
  bodyHtml: string;
  bodyText: string[];
  reason: string;
  cta?: { href: string; label: string };
  secondaryLinks?: Array<{ href: string; label: string }>;
  footerNote?: string;
}

function formatHours(seconds: number): string {
  const hours = Math.max(1, Math.round(seconds / 3600));
  return hours === 1 ? 'én time' : `${hours} timer`;
}

export function formatTokenExpiryCopy(seconds = AUTH_TOKEN_EXPIRES_IN_SECONDS): string {
  return `Lenken er gyldig i ${formatHours(seconds)}.`;
}

function renderCtaButton(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px;">
      <tr>
        <td align="center" bgcolor="#111111" style="border-radius:8px;">
          <a href="${safeHref}" style="display:inline-block;padding:14px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;line-height:1.2;color:#ffffff;text-decoration:none;border-radius:8px;">
            ${safeLabel}
          </a>
        </td>
      </tr>
    </table>
  `.trim();
}

export function renderTransactionalEmail(options: LayoutOptions): EmailParts {
  const subject = sanitizeSubject(options.subject);
  const preheader = sanitizeSubject(options.preheader);
  const siteUrl = BRAND.siteUrl;
  // Keep PNG for transactional email compatibility with legacy Outlook clients.
  const logoUrl = `${siteUrl}/logos/clea-wordmark-black.png`;
  const safeSite = escapeHtml(siteUrl);
  const safeDomain = escapeHtml(BRAND.domain);
  const safeBrand = escapeHtml(BRAND.name);
  const safeContact = escapeHtml(COMPANY.email);
  const safeHeading = escapeHtml(options.heading);
  const safePreheader = escapeHtml(preheader);
  const safeReason = escapeHtml(options.reason);

  const ctaHref = options.cta ? safeHttpUrl(options.cta.href) : null;
  const ctaBlock =
    ctaHref && options.cta
      ? renderCtaButton(ctaHref, options.cta.label)
      : '';

  const secondaryHtml = (options.secondaryLinks ?? [])
    .map((link) => {
      const href = safeHttpUrl(link.href);
      if (!href) return null;
      return `<a href="${escapeHtml(href)}" style="color:#555555;text-decoration:underline;">${escapeHtml(link.label)}</a>`;
    })
    .filter((line): line is string => Boolean(line))
    .join(' &nbsp;·&nbsp; ');

  const footerNote = options.footerNote
    ? `<p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#888888;">${escapeHtml(options.footerNote)}</p>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="nb">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(subject)}</title>
  <style>
    :root { color-scheme: light; supported-color-schemes: light; }
    @media only screen and (max-width: 520px) {
      .email-outer { padding: 12px 8px !important; }
      .email-content { padding: 8px 20px 28px !important; }
      .email-footer { padding: 18px 20px 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;color-scheme:light;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${safePreheader}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#f4f4f5;">
    <tr>
      <td align="center" class="email-outer" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 8px;text-align:center;">
              <a href="${safeSite}" style="text-decoration:none;">
                <img src="${escapeHtml(logoUrl)}" width="96" alt="${safeBrand}" style="display:inline-block;border:0;outline:none;height:auto;max-width:120px;" />
              </a>
            </td>
          </tr>
          <tr>
            <td class="email-content" style="padding:8px 28px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111111;">
              <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;font-weight:700;">${safeHeading}</h1>
              <div style="font-size:15px;line-height:1.65;color:#333333;">
                ${options.bodyHtml}
              </div>
              ${ctaBlock}
              ${
                secondaryHtml
                  ? `<p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#666666;">${secondaryHtml}</p>`
                  : ''
              }
            </td>
          </tr>
          <tr>
            <td class="email-footer" style="padding:20px 28px 28px;border-top:1px solid #ececee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#888888;">
                <a href="${safeSite}" style="color:#555555;text-decoration:none;font-weight:600;">${safeBrand}</a>
                &nbsp;·&nbsp;
                <a href="${safeSite}" style="color:#888888;text-decoration:none;">${safeDomain}</a>
              </p>
              <p style="margin:10px 0 0;font-size:12px;line-height:1.5;color:#888888;">${safeReason}</p>
              <p style="margin:10px 0 0;font-size:12px;line-height:1.5;color:#888888;">
                Kontakt: <a href="mailto:${safeContact}" style="color:#888888;text-decoration:underline;">${safeContact}</a>
              </p>
              ${footerNote}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const textLines = [
    ...options.bodyText,
    '',
    options.cta && ctaHref ? `${options.cta.label}: ${ctaHref}` : null,
    ...(options.secondaryLinks ?? [])
      .map((link) => {
        const href = safeHttpUrl(link.href);
        return href ? `${link.label}: ${href}` : null;
      })
      .filter((line): line is string => Boolean(line)),
    '',
    options.reason,
    `Kontakt: ${COMPANY.email}`,
    options.footerNote ?? null,
    '',
    `${BRAND.name} · ${siteUrl}`,
  ].filter((line): line is string => line !== null);

  return {
    subject,
    preheader,
    html,
    text: textLines.join('\n'),
  };
}
