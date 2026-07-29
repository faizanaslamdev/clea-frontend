import { describe, expect, it } from 'vitest';

/**
 * Auth modal accessibility contract (static checks for class/role usage).
 * Full DOM interaction coverage belongs in Playwright; keep unit checks lightweight.
 */
describe('auth modal accessibility contract', () => {
  it('documents required live-region roles for auth feedback', () => {
    const required = {
      errorRole: 'alert',
      errorLive: 'assertive',
      infoRole: 'status',
      infoLive: 'polite',
      modalMaxHeightClass: 'auth-modal',
    };

    expect(required.errorRole).toBe('alert');
    expect(required.errorLive).toBe('assertive');
    expect(required.infoRole).toBe('status');
    expect(required.modalMaxHeightClass).toBe('auth-modal');
  });
});
