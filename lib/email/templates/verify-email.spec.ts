import { describe, expect, it } from 'vitest';
import { buildVerifyEmail } from './verify-email';

describe('buildVerifyEmail', () => {
  it('includes the verification url', () => {
    const template = buildVerifyEmail({
      url: 'https://www.clea.no/api/auth/verify?token=abc',
    });

    expect(template.subject).toContain('Bekreft');
    expect(template.text).toContain('https://www.clea.no/api/auth/verify?token=abc');
    expect(template.html).toContain('https://www.clea.no/api/auth/verify?token=abc');
  });
});
