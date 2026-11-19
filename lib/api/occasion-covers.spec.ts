import { describe, expect, it } from 'vitest';
import { pickOccasionCover } from './occasion-covers';
import type { Product } from '@/lib/types';

const p = (name: string, image = 'https://img/x.jpg') => ({ name, image }) as Product;

describe('pickOccasionCover', () => {
  it('skips pieces named for the other audience and pieces without a photo', () => {
    expect(pickOccasionCover([p('Scott Men´s Defined', ''), p("Men's blazer"), p('Blazer Viemmi')], 'womens')?.name).toBe('Blazer Viemmi');
    expect(pickOccasionCover([p('Kjole Alegra'), p('Dress herre')], 'mens')?.name).toBe('Dress herre');
    expect(pickOccasionCover([], 'womens')).toBeNull();
  });
});
