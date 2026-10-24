import { describe, expect, it, vi } from 'vitest';
import {
  isChunkLoadError,
  recoverFromChunkLoadError,
} from './chunk-load-recovery';

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
  };
}

describe('chunk load recovery', () => {
  it('recognises the errors a stale tab gets after a deploy', () => {
    const chunk = new Error('Loading chunk 4512 failed.');
    chunk.name = 'ChunkLoadError';
    expect(isChunkLoadError(chunk)).toBe(true);
    expect(
      isChunkLoadError(
        new TypeError('Failed to fetch dynamically imported module: /x.js'),
      ),
    ).toBe(true);
    expect(isChunkLoadError(new Error('Cannot read properties of null'))).toBe(
      false,
    );
    expect(isChunkLoadError(null)).toBe(false);
  });

  it('reloads once, then lets the error screen show if it happens again', () => {
    const storage = memoryStorage();
    const reload = vi.fn();
    let now = 1_000_000;
    const error = Object.assign(new Error('Loading chunk 7 failed'), {
      name: 'ChunkLoadError',
    });
    const deps = { storage, reload, now: () => now };

    expect(recoverFromChunkLoadError(error, deps)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    now += 5_000;
    expect(recoverFromChunkLoadError(error, deps)).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
    now += 120_000;
    expect(recoverFromChunkLoadError(error, deps)).toBe(true);
  });

  it('ignores other errors', () => {
    const reload = vi.fn();
    expect(
      recoverFromChunkLoadError(new Error('boom'), {
        storage: memoryStorage(),
        reload,
      }),
    ).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});
