import { describe, expect, it } from 'vitest';
import { GUIDE_REDIRECTS } from './guide-redirects.mjs';
import { GUIDES, findGuide } from './guides';

describe('guides', () => {
  it('has unique slugs', () => {
    const slugs = GUIDES.map((guide) => guide.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('redirects every old slug to a guide that exists', () => {
    for (const [from, to] of Object.entries(GUIDE_REDIRECTS)) {
      expect(findGuide(from)).toBeUndefined();
      expect(findGuide(to)).toBeDefined();
    }
  });

  it('never presents Clea as a price-comparison site', () => {
    const text = JSON.stringify(GUIDES).toLowerCase();
    for (const phrase of ['sammenlign', 'billigst', 'laveste pris', 'betaler minst', 'best pris']) {
      expect(text).not.toContain(phrase);
    }
  });
});
