/**
 * Feed image URL hygiene for API/FE (not presentation sizing).
 * Unwraps Awin productserve proxies and upgrades http → https.
 * Does NOT strip merchant size params — that belongs to resolveMerchantImageUrl.
 */

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

/**
 * Hygiene-only feed image URL (products, brand covers, banners from API).
 */
export function normalizeFeedImageUrl(
  url: string | null | undefined,
): string | null {
  if (!url?.trim()) {
    return null;
  }

  let cleaned = unwrapProductserveProxy(url.trim());
  if (/^http:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned.slice('http://'.length)}`;
  }

  return cleaned || null;
}
