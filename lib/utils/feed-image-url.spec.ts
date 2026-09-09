import { describe, expect, it } from 'vitest';
import { normalizeFeedImageUrl } from './feed-image-url';

describe('normalizeFeedImageUrl', () => {
  it('upgrades http CDN URLs to https for next/image', () => {
    expect(
      normalizeFeedImageUrl(
        'http://media.sephora.eu/on/demandware.static/Sites-Site/-/default/images/noimagelarge.png',
      ),
    ).toBe(
      'https://media.sephora.eu/on/demandware.static/Sites-Site/-/default/images/noimagelarge.png',
    );
  });

  it('leaves https URLs unchanged', () => {
    const url = 'https://media2.urverket.no/images/large/gh/gucci.jpg';
    expect(normalizeFeedImageUrl(url)).toBe(url);
  });
});
