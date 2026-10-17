import type { SearchRelaxation, SearchUnderstanding } from '@/lib/api/search';
import { SHOP_COLOUR_OPTIONS } from '@/lib/shop/shop-colours';

const AUDIENCE_LABEL = { female: 'Dame', male: 'Herre', kids: 'Barn' } as const;
const AUDIENCE_FOR = { female: 'dame', male: 'herre', kids: 'barn' } as const;

const colourLabel = (value: string) =>
  SHOP_COLOUR_OPTIONS.find((option) => option.value === value)?.label ?? value;

const kr = (value: number) => `${value.toLocaleString('nb-NO')} kr`;

const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

function joinOr(values: string[]): string {
  if (values.length <= 1) return values.join('');
  return `${values.slice(0, -1).join(', ')} eller ${values[values.length - 1]}`;
}

/** Chips for what the engine read from the query: "Jeans · Herre · Svart · Under 800 kr". */
export function understoodChips(
  understood: SearchUnderstanding,
  storeName: (id: string) => string,
): string[] {
  const chips: string[] = [];
  if (understood.categoryTerms[0]) chips.push(capitalise(understood.categoryTerms[0]));
  if (understood.audience) chips.push(AUDIENCE_LABEL[understood.audience]);
  for (const colour of understood.colourFamilies) chips.push(colourLabel(colour));
  // Brand families expand to many values; show the brand(s) the shopper named.
  chips.push(...understood.brandLabels.slice(0, 2));
  for (const id of understood.merchantIds.slice(0, 2)) chips.push(`Fra ${storeName(id)}`);
  const { minPrice, maxPrice } = understood;
  if (minPrice != null && maxPrice != null) chips.push(`${kr(minPrice)}–${kr(maxPrice)}`);
  else if (maxPrice != null) chips.push(`Under ${kr(maxPrice)}`);
  else if (minPrice != null) chips.push(`Over ${kr(minPrice)}`);
  if (understood.onSale) chips.push('På salg');
  if (understood.textWords.length) chips.push(`«${understood.textWords.join(' ')}»`);
  return chips;
}

/**
 * One honest line per constraint the engine had to drop. Never silent: the
 * shopper should see that "lilla" wasn't found rather than get other colours
 * as if they were lilla.
 */
export function relaxationNotices(
  relaxed: readonly SearchRelaxation[],
  requested: SearchUnderstanding,
  audienceFromToggle: boolean,
): string[] {
  return relaxed.map((step) => {
    switch (step) {
      case 'words':
        return `Ingen treff på «${requested.textWords.join(' ')}» – viser nærmeste treff uten ${
          requested.textWords.length > 1 ? 'disse ordene' : 'dette ordet'
        }.`;
      case 'colour':
        return `Fant ingen i ${joinOr(requested.colourFamilies.map((c) => colourLabel(c).toLowerCase()))} – viser andre farger.`;
      case 'audience':
        return requested.audience && audienceFromToggle
          ? `Få treff merket for ${AUDIENCE_FOR[requested.audience]} – viser for alle.`
          : `Fant ingen merket for ${requested.audience ? AUDIENCE_FOR[requested.audience] : 'valgt kjønn'} – viser for alle.`;
      case 'brand':
        return `Fant ingen fra ${joinOr(requested.brandLabels.length ? requested.brandLabels : requested.brands)} – viser andre merker.`;
    }
  });
}
