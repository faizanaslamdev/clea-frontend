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

  it('unwraps productserve without stripping merchant format', () => {
    expect(
      normalizeFeedImageUrl(
        'https://images2.productserve.com/?url=ssl%3Acdn.occtoo-media.com%2Fpath%2Fimg.jpg%3Fformat%3Dmedium%26outputFormat%3Dwebp',
      ),
    ).toBe(
      'https://cdn.occtoo-media.com/path/img.jpg?format=medium&outputFormat=webp',
    );
  });

  it('does not strip format=medium (presentation owns sizing)', () => {
    const url =
      'https://cdn.occtoo-media.com/a/b/c.jpg?format=medium&outputFormat=webp';
    expect(normalizeFeedImageUrl(url)).toBe(url);
  });
});
