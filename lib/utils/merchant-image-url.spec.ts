import { describe, expect, it } from 'vitest';
import { normalizeFeedImageUrl } from '@/lib/utils/feed-image-url';
import {
  getMerchantImageBaseUrl,
  resolveMerchantImageUrl,
} from '@/lib/utils/merchant-image-url';

describe('normalizeFeedImageUrl hygiene', () => {
  it('upgrades http CDN URLs to https', () => {
    expect(
      normalizeFeedImageUrl(
        'http://media.sephora.eu/on/demandware.static/Sites-Site/-/default/images/noimagelarge.png',
      ),
    ).toBe(
      'https://media.sephora.eu/on/demandware.static/Sites-Site/-/default/images/noimagelarge.png',
    );
  });

  it('unwraps productserve proxies', () => {
    expect(
      normalizeFeedImageUrl(
        'https://images2.productserve.com/?url=ssl%3Acdn.occtoo-media.com%2Fpath%2Fimg.jpg%3Fformat%3Dmedium',
      ),
    ).toBe('https://cdn.occtoo-media.com/path/img.jpg?format=medium');
  });

  it('does not strip format=medium (presentation owns sizing)', () => {
    const url =
      'https://cdn.occtoo-media.com/a/b/c.jpg?format=medium&outputFormat=webp';
    expect(normalizeFeedImageUrl(url)).toBe(url);
  });
});

describe('resolveMerchantImageUrl', () => {
  const occtoo =
    'https://cdn.occtoo-media.com/995/abc/product.jpg?format=medium&outputFormat=webp';
  const shopify =
    'https://cdn.shopify.com/s/files/1/0799/x.jpg?v=1784403250&width=200';
  const scene7 =
    'https://ralphlauren.scene7.com/is/image/PoloGSI/s7-AI312?$social_tc_1x1$=&fmt.png=&wid=200';
  const adidas =
    'https://assets.adidas.com/images/w_1080,h_1080,f_auto,q_auto:sensitive,fl_lossy/hash/Name.jpg';
  const outnorth = 'https://www.fjellsport.no/assets/blobs/1033104-79837f5456.png';
  const viking =
    'https://vikingfootwear.centracdn.net/client/dynamic/originals/1049_a-original.jpg';

  it('Occtoo: thumb/card/feature set format; gallery removes format; keeps webp', () => {
    expect(resolveMerchantImageUrl(occtoo, 'thumb')).toContain('format=medium');
    expect(resolveMerchantImageUrl(occtoo, 'card')).toContain('format=large');
    expect(resolveMerchantImageUrl(occtoo, 'feature')).toContain('format=large');
    const gallery = resolveMerchantImageUrl(occtoo, 'gallery');
    expect(gallery).not.toMatch(/[?&]format=/);
    expect(gallery).toContain('outputFormat=webp');
  });

  it('Occtoo: replaces format without duplicating', () => {
    const card = resolveMerchantImageUrl(occtoo, 'card');
    expect(card.match(/[?&]format=/g)).toHaveLength(1);
    expect(card).toContain('format=large');
  });

  it('Occtoo: ensures outputFormat=webp when missing', () => {
    const bare = 'https://cdn.occtoo-media.com/a/b.jpg';
    expect(resolveMerchantImageUrl(bare, 'card')).toContain('outputFormat=webp');
  });

  it('Shopify: sets width per role and preserves v=', () => {
    const card = resolveMerchantImageUrl(shopify, 'card');
    expect(card).toContain('width=800');
    expect(card).toContain('v=1784403250');
    expect(card.match(/width=/gi)).toHaveLength(1);
    expect(resolveMerchantImageUrl(shopify, 'thumb')).toContain('width=400');
    expect(resolveMerchantImageUrl(shopify, 'gallery')).toContain('width=1200');
  });

  it('Scene7: preserves preset and sets wid except gallery', () => {
    const card = resolveMerchantImageUrl(scene7, 'card');
    expect(card).toContain('$social_tc_1x1$');
    expect(card).toContain('wid=600');
    expect(card.match(/wid=/gi)).toHaveLength(1);
    const gallery = resolveMerchantImageUrl(scene7, 'gallery');
    expect(gallery).toContain('$social_tc_1x1$');
    expect(gallery).not.toMatch(/wid=/i);
  });

  it('Adidas: rewrites w_,h_ segment only', () => {
    expect(resolveMerchantImageUrl(adidas, 'card')).toContain(
      '/images/w_600,h_600,f_auto,q_auto:sensitive,fl_lossy/',
    );
    expect(resolveMerchantImageUrl(adidas, 'gallery')).toContain(
      '/images/w_1080,h_1080,f_auto,q_auto:sensitive,fl_lossy/',
    );
    expect(
      resolveMerchantImageUrl(
        'https://assets.adidas.com/images/other/path.jpg',
        'card',
      ),
    ).toBe('https://assets.adidas.com/images/other/path.jpg');
  });

  it('Outnorth blobs: sets w= on verified hosts/paths', () => {
    expect(resolveMerchantImageUrl(outnorth, 'card')).toBe(
      `${outnorth}?w=800`,
    );
    expect(
      resolveMerchantImageUrl(
        'https://prod.fjellsport.no/assets/blobs/x.png?w=100',
        'gallery',
      ),
    ).toBe('https://prod.fjellsport.no/assets/blobs/x.png?w=1200');
    expect(
      resolveMerchantImageUrl('https://www.fjellsport.no/other/x.png', 'card'),
    ).toBe('https://www.fjellsport.no/other/x.png');
  });

  it('Viking and unknown hosts passthrough', () => {
    expect(resolveMerchantImageUrl(viking, 'card')).toBe(viking);
    expect(
      resolveMerchantImageUrl('https://cdn.example.com/a.jpg?x=1', 'card'),
    ).toBe('https://cdn.example.com/a.jpg?x=1');
  });

  it('malformed URL safe passthrough', () => {
    expect(resolveMerchantImageUrl('not-a-url', 'card')).toBe('not-a-url');
  });

  it('getMerchantImageBaseUrl strips size knobs for fallback', () => {
    expect(getMerchantImageBaseUrl(occtoo)).not.toMatch(/[?&]format=/);
    expect(getMerchantImageBaseUrl(occtoo)).toContain('outputFormat=webp');
    expect(getMerchantImageBaseUrl(shopify)).not.toMatch(/[?&]width=/);
    expect(getMerchantImageBaseUrl(shopify)).toContain('v=1784403250');
  });
});
