import { describe, expect, it } from 'vitest';
import { ApiError } from './backend-client';
import { resolveChatErrorMessage } from './api-errors';

describe('resolveChatErrorMessage', () => {
  it('maps rate_limit_exceeded code to Norwegian copy', () => {
    expect(
      resolveChatErrorMessage(
        new ApiError('Too many', 429, 'rate_limit_exceeded'),
      ),
    ).toContain('for mange forespørsler');
  });

  it('maps 503 without code to service unavailable copy', () => {
    expect(resolveChatErrorMessage(new ApiError('down', 503))).toContain(
      'utilgjengelig',
    );
  });

  it('maps network failures', () => {
    expect(resolveChatErrorMessage(new TypeError('fetch failed'))).toContain(
      'nettverket',
    );
  });
});
