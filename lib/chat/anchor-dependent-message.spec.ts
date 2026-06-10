import { describe, expect, it } from 'vitest';
import {
  isAnchorDependentComposerMessage,
  resolveComposerTurnContext,
} from '@/lib/chat/anchor-dependent-message';

const ANCHOR_ID = '6085790a-490d-418e-839f-9bfc083256c8';

describe('isAnchorDependentComposerMessage', () => {
  it('detects similar and cheaper composer paraphrases', () => {
    expect(isAnchorDependentComposerMessage('Need something similar but cheaper')).toBe(
      true,
    );
    expect(isAnchorDependentComposerMessage('show me something similar')).toBe(true);
    expect(isAnchorDependentComposerMessage('jakke under 800 kr')).toBe(false);
  });
});

describe('resolveComposerTurnContext', () => {
  it('attaches active productId for anchor-dependent composer turns', () => {
    expect(
      resolveComposerTurnContext(
        'Need something similar but cheaper',
        undefined,
        ANCHOR_ID,
      ),
    ).toEqual({ productId: ANCHOR_ID });
  });

  it('keeps explicit context productId', () => {
    expect(
      resolveComposerTurnContext(
        'Need something similar but cheaper',
        { productId: 'other-id' },
        ANCHOR_ID,
      ),
    ).toEqual({ productId: 'other-id' });
  });

  it('leaves normal search context unchanged', () => {
    expect(
      resolveComposerTurnContext('white sneakers', undefined, ANCHOR_ID),
    ).toBeUndefined();
  });
});
