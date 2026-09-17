import { describe, expect, it } from 'vitest';
import {
  advanceRemoteProductImagePhase,
  initialRemoteProductImagePhase,
  remoteProductImageRemountKey,
  remoteProductImageSrcForPhase,
  remoteProductImageUnoptimized,
  type RemoteProductImagePhase,
} from '@/lib/ui/remote-product-image-phase';

describe('remote product image phase ladder', () => {
  it('starts on base when sized equals base', () => {
    expect(initialRemoteProductImagePhase('https://a', 'https://a')).toBe('base');
  });

  it('starts on sized when transforms differ', () => {
    expect(
      initialRemoteProductImagePhase('https://a?w=1', 'https://a'),
    ).toBe('sized');
  });

  it('advances sized → base → failed without looping', () => {
    let phase: RemoteProductImagePhase = 'sized';
    phase = advanceRemoteProductImagePhase(phase, 'https://a?w=1', 'https://a');
    expect(phase).toBe('base');
    expect(
      remoteProductImageSrcForPhase('base', 'https://a?w=1', 'https://a'),
    ).toBe('https://a');
    phase = advanceRemoteProductImagePhase(phase, 'https://a?w=1', 'https://a');
    expect(phase).toBe('failed');
    phase = advanceRemoteProductImagePhase(phase, 'https://a?w=1', 'https://a');
    expect(phase).toBe('failed');
  });

  it('skips duplicate retry when sized === base', () => {
    expect(
      advanceRemoteProductImagePhase('sized', 'https://a', 'https://a'),
    ).toBe('failed');
  });

  it('always reports unoptimized while Vercel IO is disabled', () => {
    expect(remoteProductImageUnoptimized('sized')).toBe(true);
    expect(remoteProductImageUnoptimized('base')).toBe(true);
  });

  it('remount keys differ by phase/src', () => {
    const src = 'https://cdn.example/a.jpg';
    expect(remoteProductImageRemountKey(src, 'sized')).not.toBe(
      remoteProductImageRemountKey(src, 'base'),
    );
  });
});
