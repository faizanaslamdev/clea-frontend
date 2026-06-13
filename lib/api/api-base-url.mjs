/** @typedef {{ NEXT_PUBLIC_API_URL?: string; NODE_ENV?: string }} ApiUrlEnv */

export const LOCAL_DEV_DEFAULT_API_URL = 'http://localhost:3000';

const LOOPBACK_HOSTNAMES = new Set(['localhost', '::1', '[::1]']);

/**
 * @param {string} hostname
 */
export function isLoopbackHost(hostname) {
  const normalized = hostname.trim().toLowerCase();
  if (!normalized) return false;
  if (LOOPBACK_HOSTNAMES.has(normalized)) return true;
  return /^127(?:\.\d{1,3}){3}$/.test(normalized);
}

/**
 * @param {string | undefined} rawUrl
 * @returns {string}
 */
export function validateProductionApiUrl(rawUrl) {
  const trimmed = (rawUrl ?? '').trim();
  if (!trimmed) {
    const deploymentHint = process.env.VERCEL
      ? ' In Vercel: Project → Settings → Environment Variables → add NEXT_PUBLIC_API_URL for Production (and Preview if needed), then redeploy.'
      : ' Set NEXT_PUBLIC_API_URL in your host (e.g. Vercel Project → Settings → Environment Variables → Production), then redeploy.';
    throw new Error(
      `NEXT_PUBLIC_API_URL is required for production builds.${deploymentHint} Example: https://api.clea.no`,
    );
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_API_URL is not a valid URL: "${trimmed}". Use an absolute URL such as https://api.example.com.`,
    );
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(
      `NEXT_PUBLIC_API_URL must use http or https (got "${parsed.protocol}").`,
    );
  }

  if (isLoopbackHost(parsed.hostname)) {
    throw new Error(
      `NEXT_PUBLIC_API_URL must not point to localhost or loopback in production (got "${parsed.hostname}"). Set it to your deployed Clea backend URL.`,
    );
  }

  return trimmed.replace(/\/$/, '');
}

/**
 * @param {ApiUrlEnv} [env]
 * @returns {string}
 */
export function resolveApiBaseUrl(env = process.env) {
  const raw = env.NEXT_PUBLIC_API_URL;

  if (env.NODE_ENV === 'production') {
    return validateProductionApiUrl(raw);
  }

  return (raw?.trim() || LOCAL_DEV_DEFAULT_API_URL).replace(/\/$/, '');
}
