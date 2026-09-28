import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/types';
import { formatListingPrice, formatPrice } from '@/lib/domain/format';

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

function baseProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Festkjoler',
    brand: 'Malina',
    image: 'https://static.miinto.net/x.webp',
    category: 'Fashion',
    description: '',
    sku: 'x',
    matchType: 'exact',
    rating: 0,
    reviewCount: 0,
    prices: { miinto: 1929 },
    priceHistory: [],
    inStock: { miinto: true },
    lowestPrice: 1929,
    highestPrice: 1929,
    averagePrice: 1929,
    savingsPercent: 0,
    trending: false,
    trendingScore: 0,
    currency: 'NOK',
    merchantId: 'miinto',
    merchantName: 'Miinto',
    isFromPrice: false,
    ...overrides,
  };
}

describe('ProductCard from-price display', () => {
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

  it('renders exact price without Fra/From', () => {
    act(() => {
      root.render(<ProductCard product={baseProduct()} storeId="miinto" />);
    });
    const text = container.textContent ?? '';
    expect(text).toContain(formatPrice(1929, 'NOK'));
    expect(text).not.toContain('Fra ');
    expect(text).not.toContain('From ');
  });

  it('renders Fra prefix for from-price products', () => {
    act(() => {
      root.render(
        <ProductCard
          product={baseProduct({ isFromPrice: true })}
          storeId="miinto"
        />,
      );
    });
    expect(container.textContent).toContain(
      formatListingPrice(1929, 'NOK', { isFromPrice: true }),
    );
  });

  it('leaves existing merchant exact price unchanged', () => {
    act(() => {
      root.render(
        <ProductCard
          product={baseProduct({
            merchantId: 'asos',
            merchantName: 'ASOS',
            prices: { asos: 499 },
            inStock: { asos: true },
            lowestPrice: 499,
            isFromPrice: false,
          })}
          storeId="asos"
        />,
      );
    });
    const text = container.textContent ?? '';
    expect(text).toContain(formatPrice(499, 'NOK'));
    expect(text).not.toContain('Fra ');
  });
});
