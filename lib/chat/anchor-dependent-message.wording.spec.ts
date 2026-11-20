import { describe, expect, it } from 'vitest';
import { isAnchorDependentComposerMessage } from './anchor-dependent-message';

describe('typed text about the product in focus', () => {
  it.each([
    'Same in different colours',
    'Har du den i andre farger?',
    'Har du denne i svart?',
    'Do you have it in black?',
    'this in white',
    'Samme i rødt',
    'Rimeligere?',
    'Billigste variant',
    'Liknende produkter',
    'tilsvarende',
  ])('"%s" keeps the product', (message) => {
    expect(isAnchorDependentComposerMessage(message)).toBe(true);
  });

  it.each(['slim fit jeans herre', 'jakke i svart', 'Noe pent til julebord'])('"%s" is a new search', (message) => {
    expect(isAnchorDependentComposerMessage(message)).toBe(false);
  });
});
