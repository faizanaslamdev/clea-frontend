import type { ShopCategory, SuitableFor } from '@/lib/api/chat-types';

/** `gender` URL param <-> backend `suitable_for`. Defaults to dame. */
export function parseShopGenderParam(value: string | null | undefined): SuitableFor {
  return value === 'herre' ? 'male' : 'female';
}

export function shopGenderParamFor(value: SuitableFor): string {
  return value === 'male' ? 'herre' : 'dame';
}

export function shopCategoryFor(value: SuitableFor): ShopCategory {
  return value === 'male' ? 'mens' : 'womens';
}
