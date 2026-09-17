import { normalizeFeedImageUrl } from '@/lib/utils/feed-image-url';

export type ProductImageRole = 'thumb' | 'card' | 'feature' | 'gallery';

const OCCTOO_HOST = 'cdn.occtoo-media.com';
const SHOPIFY_HOST = 'cdn.shopify.com';
const SCENE7_HOST = 'ralphlauren.scene7.com';
const ADIDAS_HOST = 'assets.adidas.com';
const FJELLSPORT_HOSTS = new Set(['www.fjellsport.no', 'prod.fjellsport.no']);

const OCCTOO_FORMAT: Record<Exclude<ProductImageRole, 'gallery'>, string> = {
  thumb: 'medium',
  card: 'large',
  feature: 'large',
};

const SHOPIFY_WIDTH: Record<ProductImageRole, number> = {
  thumb: 400,
  card: 800,
  feature: 800,
  gallery: 1200,
};

const SCENE7_WID: Record<Exclude<ProductImageRole, 'gallery'>, number> = {
  thumb: 400,
  card: 600,
  feature: 800,
};

const ADIDAS_SIZE: Record<ProductImageRole, number> = {
  thumb: 400,
  card: 600,
  feature: 800,
  gallery: 1080,
};

const OUTNORTH_W: Record<ProductImageRole, number> = {
  thumb: 400,
  card: 800,
  feature: 1000,
  gallery: 1200,
};

function serializeUrl(parsed: URL): string {
  const query = parsed.searchParams.toString();
  return query
    ? `${parsed.origin}${parsed.pathname}?${query}`
    : `${parsed.origin}${parsed.pathname}`;
}

function deleteParamsCaseInsensitive(parsed: URL, names: string[]): void {
  const targets = new Set(names.map((name) => name.toLowerCase()));
  for (const key of [...parsed.searchParams.keys()]) {
    if (targets.has(key.toLowerCase())) {
      parsed.searchParams.delete(key);
    }
  }
}

function setParam(parsed: URL, name: string, value: string): void {
  deleteParamsCaseInsensitive(parsed, [name]);
  parsed.searchParams.set(name, value);
}

/**
 * Scene7 presets use `$name$=` keys that URLSearchParams percent-encodes.
 * Manipulate the raw query string so presets stay as the CDN expects.
 */
function rewriteRawQueryParam(
  url: string,
  name: string,
  value: string | null,
): string {
  const parsed = new URL(url);
  const raw = parsed.search.startsWith('?') ? parsed.search.slice(1) : '';
  const nameLower = name.toLowerCase();
  const parts = raw
    .split('&')
    .filter(Boolean)
    .filter((part) => {
      const key = part.split('=')[0] ?? '';
      try {
        return decodeURIComponent(key).toLowerCase() !== nameLower;
      } catch {
        return key.toLowerCase() !== nameLower;
      }
    });

  if (value !== null) {
    parts.push(`${name}=${value}`);
  }

  const query = parts.length > 0 ? `?${parts.join('&')}` : '';
  return `${parsed.origin}${parsed.pathname}${query}`;
}

/**
 * Hygiene + strip known presentation size knobs so role transforms replace
 * cleanly and fallbacks retry a true unsized/base merchant URL.
 */
export function getMerchantImageBaseUrl(url: string): string {
  const cleaned = normalizeFeedImageUrl(url) ?? url.trim();
  if (!cleaned) {
    return cleaned;
  }

  try {
    const parsed = new URL(cleaned);
    const host = parsed.hostname.toLowerCase();

    if (host === OCCTOO_HOST) {
      deleteParamsCaseInsensitive(parsed, ['format']);
      return serializeUrl(parsed);
    }

    if (host === SHOPIFY_HOST) {
      deleteParamsCaseInsensitive(parsed, ['width']);
      return serializeUrl(parsed);
    }

    if (host === SCENE7_HOST) {
      return rewriteRawQueryParam(cleaned, 'wid', null);
    }

    if (FJELLSPORT_HOSTS.has(host) && parsed.pathname.includes('/assets/blobs/')) {
      deleteParamsCaseInsensitive(parsed, ['w', 'width']);
      return serializeUrl(parsed);
    }

    // Adidas / Viking / unknown: path or opaque feed URL is the base.
    return cleaned;
  } catch {
    return cleaned;
  }
}

function applyOcctoo(base: string, role: ProductImageRole): string {
  const parsed = new URL(base);
  if (role === 'gallery') {
    deleteParamsCaseInsensitive(parsed, ['format']);
  } else {
    setParam(parsed, 'format', OCCTOO_FORMAT[role]);
  }
  if (![...parsed.searchParams.keys()].some((key) => key.toLowerCase() === 'outputformat')) {
    parsed.searchParams.set('outputFormat', 'webp');
  }
  return serializeUrl(parsed);
}

function applyShopify(base: string, role: ProductImageRole): string {
  const parsed = new URL(base);
  setParam(parsed, 'width', String(SHOPIFY_WIDTH[role]));
  return serializeUrl(parsed);
}

function applyScene7(base: string, role: ProductImageRole): string {
  // Gallery: keep feed presets; do not invent wid upscales on social crops.
  if (role === 'gallery') {
    return rewriteRawQueryParam(base, 'wid', null);
  }
  return rewriteRawQueryParam(base, 'wid', String(SCENE7_WID[role]));
}

function applyAdidas(base: string, role: ProductImageRole): string {
  const size = ADIDAS_SIZE[role];
  const rewritten = base.replace(
    /\/images\/w_\d+,h_\d+,/i,
    `/images/w_${size},h_${size},`,
  );
  return rewritten === base ? base : rewritten;
}

function applyOutnorth(base: string, role: ProductImageRole): string {
  const parsed = new URL(base);
  deleteParamsCaseInsensitive(parsed, ['width']);
  setParam(parsed, 'w', String(OUTNORTH_W[role]));
  return serializeUrl(parsed);
}

/**
 * Presentation-time merchant CDN sizing. Pass raw or normalized URLs.
 * Unknown hosts and malformed URLs return the hygiene/base URL unchanged.
 */
export function resolveMerchantImageUrl(
  url: string,
  role: ProductImageRole,
): string {
  if (!url?.trim()) {
    return url;
  }

  const base = getMerchantImageBaseUrl(url);

  try {
    const host = new URL(base).hostname.toLowerCase();

    if (host === OCCTOO_HOST) {
      return applyOcctoo(base, role);
    }
    if (host === SHOPIFY_HOST) {
      return applyShopify(base, role);
    }
    if (host === SCENE7_HOST) {
      return applyScene7(base, role);
    }
    if (host === ADIDAS_HOST) {
      return applyAdidas(base, role);
    }
    if (FJELLSPORT_HOSTS.has(host) && new URL(base).pathname.includes('/assets/blobs/')) {
      return applyOutnorth(base, role);
    }

    return base;
  } catch {
    return base;
  }
}
