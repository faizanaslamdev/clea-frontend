import { describe, expect, it } from 'vitest';
import { safeHttpUrl, sanitizeSubject } from './safe-url';

describe('email safe-url helpers', () => {
  it('allows only absolute http(s) urls', () => {
    expect(safeHttpUrl('https://www.clea.no/account')).toBe(
      'https://www.clea.no/account',
    );
    expect(safeHttpUrl('http://localhost:3001/reset')).toContain('http://');
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(safeHttpUrl('ftp://files.example')).toBeNull();
  });

  it('sanitizes subject newlines', () => {
    expect(sanitizeSubject('Line 1\r\nLine 2')).toBe('Line 1 Line 2');
  });
});
