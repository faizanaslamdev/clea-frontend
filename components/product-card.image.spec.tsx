import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/types';

vi.mock('next/image', () => ({
  default: ({
    fill: _fill,
    unoptimized,
    onError,
    priority: _priority,
    sizes: _sizes,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    unoptimized?: boolean;
    priority?: boolean;
    sizes?: string;
  }) => (
    <img
      {...props}
      data-unoptimized={unoptimized ? 'true' : 'false'}
      onError={onError}
    />
  ),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/chat/chat-anchor-provider', () => ({
  useChatAnchorConnection: () => null,
}));

vi.mock('@/components/product/product-desktop-modal-provider', () => ({
  useProductDesktopModal: () => ({
    openProductModal: vi.fn(),
    closeProductModal: vi.fn(),
    isProductModalOpen: false,
  }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ prefetchQuery: vi.fn() }),
}));

const PRODUCT = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Her Sense',
  brand: 'viking',
  image: 'https://cdn.example/her-sense.jpg',
  category: 'Fashion',
  description: '',
  sku: 'x',
  matchType: 'exact',
  rating: 0,
  reviewCount: 0,
  prices: { m1: 1400 },
  priceHistory: [],
  inStock: { m1: true },
  lowestPrice: 1400,
  highestPrice: 1400,
  averagePrice: 1400,
  savingsPercent: 0,
  trending: false,
  trendingScore: 0,
  currency: 'NOK',
  merchantId: 'm1',
  merchantName: 'Viking Footwear',
} as Product;

describe('ProductCard image ladder', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('preserves optimizer → direct CDN → empty wrap fallback', () => {
    act(() => {
      root.render(<ProductCard product={PRODUCT} />);
    });

    expect(container.querySelector('.product-card__image-wrap')).not.toBeNull();
    expect(container.querySelector('img')?.getAttribute('data-unoptimized')).toBe(
      'false',
    );

    act(() => {
      container.querySelector('img')?.dispatchEvent(new Event('error'));
    });
    expect(container.querySelector('img')?.getAttribute('data-unoptimized')).toBe(
      'true',
    );

    act(() => {
      container.querySelector('img')?.dispatchEvent(new Event('error'));
    });
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.product-card__image-wrap')).not.toBeNull();
  });
});
