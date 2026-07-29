import { describe, expect, it } from 'vitest';
import { buildVerifyEmail } from './verify-email';
import { buildWelcomeEmail } from './welcome';
import { buildResetPasswordEmail } from './reset-password';
import { buildPasswordChangedEmail } from './password-changed';

describe('auth email templates', () => {
  it('verify email includes expiry, CTA and no outdated copy', () => {
    const template = buildVerifyEmail({
      url: 'https://www.clea.no/api/auth/verify-email?token=abc&callbackURL=%2Faccount',
    });

    expect(template.subject).toBe('Bekreft e-postadressen din');
    expect(template.preheader).toContain('komme i gang');
    expect(template.html).toContain('Bekreft e-post');
    expect(template.html).toContain('én time');
    expect(template.text).toContain(
      'https://www.clea.no/api/auth/verify-email?token=abc&callbackURL=%2Faccount',
    );
    expect(template.html.toLowerCase()).not.toContain('coming soon');
    expect(template.html).not.toContain('aktiveres snart');
    expect(template.html).not.toContain('undefined');
    expect(template.html).not.toContain('null');
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
