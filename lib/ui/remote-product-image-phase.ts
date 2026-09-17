/**
 * Load ladder for remote merchant product images (Vercel IO disabled):
 * SIZED (merchant CDN transform) → BASE (unsized/hygiene URL) → FAILED.
 * When sized === base, skip the duplicate attempt.
 */

export type RemoteProductImagePhase = 'sized' | 'base' | 'failed';

export function initialRemoteProductImagePhase(
  sizedSrc: string,
  baseSrc: string,
): RemoteProductImagePhase {
  return sizedSrc === baseSrc ? 'base' : 'sized';
}

/** Advance one step on load error. FAILED is terminal. */
export function advanceRemoteProductImagePhase(
  phase: RemoteProductImagePhase,
  sizedSrc: string,
  baseSrc: string,
): RemoteProductImagePhase {
  if (phase === 'sized') {
    return sizedSrc === baseSrc ? 'failed' : 'base';
  }
  return 'failed';
}

export function remoteProductImageSrcForPhase(
  phase: Exclude<RemoteProductImagePhase, 'failed'>,
  sizedSrc: string,
  baseSrc: string,
): string {
  return phase === 'sized' ? sizedSrc : baseSrc;
}

/** Always unoptimized while Vercel Image Optimization is unavailable. */
export function remoteProductImageUnoptimized(
  _phase: RemoteProductImagePhase,
): boolean {
  return true;
}

export function remoteProductImageRemountKey(
  displaySrc: string,
  phase: RemoteProductImagePhase,
): string {
  return `${displaySrc}::${phase}`;
}
