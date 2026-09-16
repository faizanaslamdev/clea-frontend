/**
 * Load ladder for remote merchant product images:
 * OPTIMIZED (next/image) → DIRECT (unoptimized CDN) → FAILED (placeholder).
 * Pure helpers so phase transitions stay testable without mounting Next Image.
 */

export type RemoteProductImagePhase = 'optimized' | 'direct' | 'failed';

/** Advance one step on load error. FAILED is terminal. */
export function advanceRemoteProductImagePhase(
  phase: RemoteProductImagePhase,
): RemoteProductImagePhase {
  if (phase === 'optimized') {
    return 'direct';
  }
  return 'failed';
}

export function remoteProductImageUnoptimized(
  phase: RemoteProductImagePhase,
): boolean {
  return phase === 'direct';
}

export function remoteProductImageRemountKey(
  src: string,
  phase: RemoteProductImagePhase,
): string {
  return `${src}::${phase}`;
}
