import { describe, expect, it } from 'vitest';
import { buildVerifyEmail, emailLangFromVerifyUrl } from './verify-email';
import { buildWelcomeEmail } from './welcome';
import { buildResetPasswordEmail } from './reset-password';
import { buildPasswordChangedEmail } from './password-changed';

describe('auth email templates', () => {
  it('verify email includes expiry, CTA and no outdated copy', () => {
    const template = buildVerifyEmail({
      url: 'https://www.clea.no/api/auth/verify-email?token=abc&callbackURL=%2Faccount',
    });

    expect(template.subject).toBe('Bekreft e-postadressen din');
    expect(template.preheader).toContain('i gang');
    expect(template.html).toContain('Bekreft e-post');
    expect(template.html).toContain('én time');
    expect(template.text).toContain(
      'https://www.clea.no/api/auth/verify-email?token=abc&callbackURL=%2Faccount',
    );
    // The written-out link comes after the button, not before it.
    expect(template.html.indexOf('Virker ikke knappen?')).toBeGreaterThan(
      template.html.indexOf('padding:14px 28px'),
    );
    expect(template.html.toLowerCase()).not.toContain('coming soon');
    expect(template.html).not.toContain('aktiveres snart');
    expect(template.html).not.toContain('undefined');
    expect(template.html).not.toContain('null');
  });

  it('verify email is English when the app asks for it', () => {
    const url =
      'https://www.clea.no/api/auth/verify-email?token=abc&callbackURL=' +
      encodeURIComponent('https://www.clea.no/verified?source=app&lang=en');
    expect(emailLangFromVerifyUrl(url)).toBe('en');
    expect(
      emailLangFromVerifyUrl(
        'https://www.clea.no/api/auth/verify-email?token=abc&callbackURL=%2Faccount',
      ),
    ).toBe('nb');

    const template = buildVerifyEmail({ url, lang: 'en' });
    expect(template.subject).toBe('Confirm your e-mail address');
    expect(template.html).toContain('Confirm e-mail');
    expect(template.html).toContain('one hour');
    expect(template.html).toContain('<html lang="en">');
    expect(template.html).not.toContain('Kontakt:');
  });

  it('welcome email reflects live price alerts', () => {
    const template = buildWelcomeEmail({ name: 'Ada <script>' });

    expect(template.subject).toBe('E-postadressen din er bekreftet');
    expect(template.preheader).toContain('prisfall');
    expect(template.html).toContain('Ada &lt;script&gt;');
    expect(template.html).toContain('følge favorittene');
    expect(template.html).toContain('Gå til kontoen din');
    expect(template.html).not.toContain('aktiveres snart');
    expect(template.text).not.toContain('aktiveres snart');
  });

  it('reset password email includes security and expiry copy', () => {
    const template = buildResetPasswordEmail({
      url: 'https://www.clea.no/reset-password?token=xyz',
    });

    expect(template.subject).toBe('Tilbakestill passordet ditt');
    expect(template.preheader).toContain('én time');
    expect(template.html).toContain('Tilbakestill passord');
    expect(template.html).toContain('forblir uendret');
    expect(template.text).toContain('https://www.clea.no/reset-password?token=xyz');
  });

  it('password changed email uses real contact address', () => {
    const template = buildPasswordChangedEmail({ name: 'Ada' });

    expect(template.subject).toBe('Passordet ditt er endret');
    expect(template.preheader).toContain('endret');
    expect(template.html).toContain('hei@clea.no');
    expect(template.text).toContain('hei@clea.no');
  });

  it('rejects unsafe verification URLs', () => {
    expect(() => buildVerifyEmail({ url: 'javascript:alert(1)' })).toThrow(
      /valid http\(s\) URL/,
    );
  });
});
