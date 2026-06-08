/** Query params that force downscaled feed images (keep outputFormat=webp). */
const STRIP_PARAMS = new Set(['format']);

function decodeProductserveTarget(encoded: string): string {
  const decoded = decodeURIComponent(encoded.trim());

  if (/^https?:\/\//i.test(decoded)) {
    return decoded;
  }

  if (/^ssl:/i.test(decoded)) {
    return `https://${decoded.slice(4).replace(/^\/+/, '')}`;
  }

  return `https://${decoded.replace(/^\/+/, '')}`;
}

function unwrapProductserveProxy(url: string): string {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('productserve.com')) {
      return url;
    }

    const inner = parsed.searchParams.get('url');
    if (!inner) {
      return url;
    }

    return decodeProductserveTarget(inner);
  } catch {
    return url;
  }
}

function stripResizeQueryParams(url: string): string {
  try {
    const parsed = new URL(url);
    for (const key of [...parsed.searchParams.keys()]) {
      if (STRIP_PARAMS.has(key.toLowerCase())) {
        parsed.searchParams.delete(key);
      }
    }

    const query = parsed.searchParams.toString();
    return query
      ? `${parsed.origin}${parsed.pathname}?${query}`
      : `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url
      .replace(/([?&])format=[^&]*/gi, '$1')
      .replace(/([?&])$/, '')
      .replace(/\?$/, '');
  }
}

/**
 * Full-quality feed image URL (products, brand covers, banners from API).
 * Strips format=medium (keeps outputFormat=webp) and unwraps productserve proxies.
 */
export function normalizeFeedImageUrl(
  url: string | null | undefined,
): string | null {
  if (!url?.trim()) {
    return null;
  }

  let cleaned = unwrapProductserveProxy(url.trim());
  cleaned = stripResizeQueryParams(cleaned);

  return cleaned || null;
}
