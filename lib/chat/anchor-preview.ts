import type { Product } from '@/lib/types';
import {
  ANCHOR_CHEAPER_MESSAGE,
  ANCHOR_SIMILAR_MESSAGE,
} from '@/lib/chat/anchor-actions';

export interface AnchorPreview {
  productId: string;
  name: string;
  image: string;
  brand?: string;
}

export function isAnchorActionMessage(message: string): boolean {
  const trimmed = message.trim();
  return (
    trimmed === ANCHOR_SIMILAR_MESSAGE || trimmed === ANCHOR_CHEAPER_MESSAGE
  );
}

export function anchorPreviewFromProduct(
  product: Pick<Product, 'id' | 'name' | 'image' | 'brand'>,
): AnchorPreview {
  return {
    productId: product.id,
    name: product.name,
    image: product.image,
    brand: product.brand,
  };
}

export function findAnchorPreviewInMessages(
  messages: readonly { anchorPreview?: AnchorPreview; products?: Product[] }[],
  productId: string,
): AnchorPreview | undefined {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.anchorPreview?.productId === productId) {
      return message.anchorPreview;
    }

    const product = message.products?.find((item) => item.id === productId);
    if (product) {
      return anchorPreviewFromProduct(product);
    }
  }

  return undefined;
}
