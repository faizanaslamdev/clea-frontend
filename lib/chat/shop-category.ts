import type { ShopCategory } from '@/lib/api/chat-types';

export function parseShopCategory(
  value: string | null | undefined,
): ShopCategory | undefined {
  if (value === 'mens' || value === 'womens') {
    return value;
  }

  return undefined;
}
