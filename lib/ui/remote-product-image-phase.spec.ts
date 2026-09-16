import { describe, expect, it } from 'vitest';
import {
  advanceRemoteProductImagePhase,
  remoteProductImageRemountKey,
  remoteProductImageUnoptimized,
  type RemoteProductImagePhase,
} from '@/lib/ui/remote-product-image-phase';

describe('remote product image phase ladder', () => {
  it('starts optimized and does not advance without an error', () => {
    const phase: RemoteProductImagePhase = 'optimized';
    expect(remoteProductImageUnoptimized(phase)).toBe(false);
    expect(remoteProductImageRemountKey('https://cdn.example/a.jpg', phase)).toBe(
      'https://cdn.example/a.jpg::optimized',
    );
  });

  it('advances optimized → direct on first failure', () => {
    expect(advanceRemoteProductImagePhase('optimized')).toBe('direct');
    expect(remoteProductImageUnoptimized('direct')).toBe(true);
  });

  it('advances direct → failed on second failure and stays failed', () => {
    expect(advanceRemoteProductImagePhase('direct')).toBe('failed');
    expect(advanceRemoteProductImagePhase('failed')).toBe('failed');
  });

  it('uses a distinct remount key per phase so the browser retries', () => {
    const src = 'https://cdn.example/shoe.jpg';
    expect(remoteProductImageRemountKey(src, 'optimized')).not.toBe(
      remoteProductImageRemountKey(src, 'direct'),
    );
  });
});
