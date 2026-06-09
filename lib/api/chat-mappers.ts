import { mapApiProductToProduct } from '@/lib/api/mappers';
import type { ApiProduct } from '@/lib/api/types';
import type { ChatProductCard } from '@/lib/api/chat-types';
import type { Product } from '@/lib/types';

export function mapChatProductCardToProduct(card: ChatProductCard): Product {
  const { on_sale: _onSale, relevance_score: _score, ...apiShape } = card;
  return mapApiProductToProduct(apiShape as ApiProduct);
}
