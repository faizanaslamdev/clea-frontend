import { anchorDisplayLabel } from '@/lib/chat/anchor-display-label';
import {
  ANCHOR_CHEAPER_MESSAGE,
  ANCHOR_SIMILAR_MESSAGE,
} from '@/lib/chat/anchor-actions';

describe('anchorDisplayLabel', () => {
  it('shortens meta product queries', () => {
    expect(anchorDisplayLabel('more details about this item')).toBe(
      'Om dette produktet',
    );
    expect(anchorDisplayLabel('mer om dette produktet')).toBe(
      'Om dette produktet',
    );
  });

  it('maps anchor action messages', () => {
    expect(anchorDisplayLabel(ANCHOR_SIMILAR_MESSAGE)).toBe('Vis lignende');
    expect(anchorDisplayLabel(ANCHOR_CHEAPER_MESSAGE)).toBe('Finn billigere');
  });
});
