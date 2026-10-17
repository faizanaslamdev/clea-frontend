import { describe, expect, it } from 'vitest';
import { buildSearchUrl, shouldOpenChat } from '@/lib/search/search-routing';

describe('shouldOpenChat', () => {
  it.each([
    'svarte herre jeans under 800',
    'Herrejakke under 1500 kr',
    'levis 501',
    'ryggsekk',
    'jeans for menn',
    'Ralph Lauren på tvers av butikker',
    'nike air max 90',
    'dunjakke barn',
  ])('searches for "%s"', (q) => expect(shouldOpenChat(q)).toBe(false));

  it.each([
    'Kjole til sommerbryllup',
    'Chinos som funker til jobb og fest',
    'hva bør jeg ha på meg på julebord?',
    'antrekk fra jobb til middag',
    'lærveske til jobb, ikke stresskoffert',
    'noe som ligner på denne jakken men billigere',
    'Ullgenser til kontordagen',
  ])('chats for "%s"', (q) => expect(shouldOpenChat(q)).toBe(true));
});

describe('buildSearchUrl', () => {
  it('carries the Dame/Herre toggle as a soft hint', () => {
    expect(buildSearchUrl(' jeans ', 'mens')).toBe('/sok?q=jeans&for=herre');
    expect(buildSearchUrl('kjole')).toBe('/sok?q=kjole');
  });
});
