import { describe, expect, it } from 'vitest';
import { scrubSentryEvent } from './sentry-scrub';
import type { ErrorEvent } from '@sentry/nextjs';

describe('scrubSentryEvent', () => {
  it('scrubs sensitive headers', () => {
    const event = scrubSentryEvent({
      request: {
        headers: {
          authorization: 'Bearer secret',
          cookie: 'better-auth.session_token=abc',
          'content-type': 'application/json',
        },
      },
    } as ErrorEvent);

    expect(event.request?.headers?.authorization).toBe('[Filtered]');
    expect(event.request?.headers?.cookie).toBe('[Filtered]');
    expect(event.request?.headers?.['content-type']).toBe('application/json');
  });

  it('scrubs passwords, emails, and tokens from request bodies', () => {
    const event = scrubSentryEvent({
      request: {
        data: {
          email: 'user@example.com',
          password: 'hunter2',
          nested: {
            newPassword: 'hunter3',
            token: 'reset-token',
          },
          safe: 'ok',
        },
      },
    } as ErrorEvent);

    expect(event.request?.data).toEqual({
      email: '[Filtered]',
      password: '[Filtered]',
      nested: {
        newPassword: '[Filtered]',
        token: '[Filtered]',
      },
      safe: 'ok',
    });
  });

  it('scrubs sensitive query params and user PII', () => {
    const event = scrubSentryEvent({
      request: {
        url: 'https://www.clea.no/api/auth/verify-email?token=abc&email=a@b.c',
      },
      user: {
        email: 'a@b.c',
        username: 'faizan',
        id: 'user-1',
      },
    } as ErrorEvent);

    expect(event.request?.url).toContain('token=%5BFiltered%5D');
    expect(event.request?.url).toContain('email=%5BFiltered%5D');
    expect(event.user?.email).toBe('[Filtered]');
    expect(event.user?.username).toBe('[Filtered]');
    expect(event.user?.id).toBe('user-1');
  });
});
