import { describe, expect, it } from 'vitest';
import { fitWithin } from './prepare-photo';
import { setPendingPhoto, takePendingPhoto } from './pending-photo';

describe('fitWithin', () => {
  it('scales the long side down to 1024', () => {
    expect(fitWithin(4032, 3024)).toEqual({ width: 1024, height: 768 });
    expect(fitWithin(1170, 2532)).toEqual({ width: 473, height: 1024 });
  });

  it('never upscales small photos', () => {
    expect(fitWithin(640, 480)).toEqual({ width: 640, height: 480 });
  });
});

describe('pending photo', () => {
  it('is handed over once', () => {
    setPendingPhoto({ dataUrl: 'data:image/jpeg;base64,AAAA', shopCategory: 'womens' });
    expect(takePendingPhoto()?.shopCategory).toBe('womens');
    expect(takePendingPhoto()).toBeNull();
  });
});
