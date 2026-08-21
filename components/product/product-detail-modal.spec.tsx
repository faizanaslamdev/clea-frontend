import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductDetailModal } from './product-detail-modal';
import type { Product } from '@/lib/types';
import {
  useProduct,
  useProductOffers,
  useSimilarProducts,
} from '@/lib/hooks/useProducts';

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock('@/components/product/product-card-anchor-menu', () => ({
  ProductCardAnchorMenu: () => null,
}));

vi.mock('@/components/product-grid', () => ({
  ProductGrid: ({ products }: { products: Product[] }) => (
    <div data-testid="similar-product-grid">
      {products.map((product) => product.name).join(', ')}
    </div>
  ),
}));

vi.mock('@/components/product/product-modal-provider', () => ({
  useProductModal: () => ({
    openProduct: vi.fn(),
    closeProduct: vi.fn(),
    isOpen: false,
  }),
}));

vi.mock('@/components/auth/notify-me-button', () => ({
  NotifyMeButton: () => null,
}));

vi.mock('@/components/product/product-best-prices', () => ({
  ProductBestPrices: () => null,
  ProductBestPricesError: () => null,
  ProductBestPricesSkeleton: () => null,
}));

vi.mock('@/lib/hooks/useProducts', () => ({
  useProduct: vi.fn(),
  useProductOffers: vi.fn(),
  useSimilarProducts: vi.fn(),
}));

const mockUseProduct = vi.mocked(useProduct);
const mockUseProductOffers = vi.mocked(useProductOffers);
const mockUseSimilarProducts = vi.mocked(useSimilarProducts);

const productId = '0f3a12be-35bb-4de3-83ea-f6cc5f44ca01';

const baseProduct: Product = {
  id: productId,
  name: 'Ultraboost',
  brand: 'adidas',
  category: 'Fashion',
  image: '/products/shoe.webp',
  description: 'Løpesko for hverdag og trening.',
  sku: 'sku-1',
  matchType: 'exact',
  rating: 4.5,
  reviewCount: 12,
  prices: { '77032': 1299 },
  priceHistory: [],
  inStock: { '77032': true },
  lowestPrice: 1299,
  highestPrice: 1299,
  averagePrice: 1299,
  savingsPercent: 0,
  trending: false,
  trendingScore: 0,
  currency: 'NOK',
  deepLink: 'https://example.com/shoe',
  merchantId: '77032',
  merchantName: 'adidas NO',
};

const similarProduct: Product = {
  ...baseProduct,
  id: 'similar-1',
  name: 'Samba OG',
};

function mockLoadedProductModal() {
  mockUseProduct.mockReturnValue({
    data: baseProduct,
    isLoading: false,
    isError: false,
    isFetched: true,
  } as ReturnType<typeof useProduct>);

  mockUseProductOffers.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  } as ReturnType<typeof useProductOffers>);
}

describe('ProductDetailModal similar products', () => {
  let container: HTMLDivElement;
  let root: Root;

  const getModalText = () => document.body.textContent ?? '';

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    document.body.innerHTML = '';
  });

  it('does not render the similar section while similar products are loading', () => {
    mockLoadedProductModal();
    mockUseSimilarProducts.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useSimilarProducts>);

    act(() => {
      root.render(
        <ProductDetailModal
          productId={productId}
          open
          onOpenChange={() => undefined}
        />,
      );
    });

    expect(document.querySelector('[aria-label="Lignende produkter"]')).toBeNull();
    expect(document.querySelector('[data-testid="product-similar-skeleton"]')).toBeNull();
    expect(getModalText()).toContain('Ultraboost');
  });

  it('renders the similar section when results are available', () => {
    mockLoadedProductModal();
    mockUseSimilarProducts.mockReturnValue({
      data: [similarProduct],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useSimilarProducts>);

    act(() => {
      root.render(
        <ProductDetailModal
          productId={productId}
          open
          onOpenChange={() => undefined}
        />,
      );
    });

    expect(document.querySelector('[aria-label="Lignende produkter"]')).not.toBeNull();
    expect(getModalText()).toContain('Lignende produkter');
    expect(getModalText()).toContain('Samba OG');
    expect(document.querySelector('[data-testid="similar-product-grid"]')).not.toBeNull();
  });

  it('keeps the similar section absent when zero results are returned', () => {
    mockLoadedProductModal();
    mockUseSimilarProducts.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useSimilarProducts>);

    act(() => {
      root.render(
        <ProductDetailModal
          productId={productId}
          open
          onOpenChange={() => undefined}
        />,
      );
    });

    expect(document.querySelector('[aria-label="Lignende produkter"]')).toBeNull();
    expect(getModalText()).toContain('Ultraboost');
  });

  it('keeps the modal usable when similar products fail silently', () => {
    mockLoadedProductModal();
    mockUseSimilarProducts.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useSimilarProducts>);

    act(() => {
      root.render(
        <ProductDetailModal
          productId={productId}
          open
          onOpenChange={() => undefined}
        />,
      );
    });

    expect(document.querySelector('[aria-label="Lignende produkter"]')).toBeNull();
    expect(getModalText()).toContain('Ultraboost');
    expect(getModalText()).toContain('adidas');
  });

  it('does not render cached similar products while the modal is closed', () => {
    mockLoadedProductModal();
    mockUseSimilarProducts.mockReturnValue({
      data: [similarProduct],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useSimilarProducts>);

    act(() => {
      root.render(
        <ProductDetailModal
          productId={productId}
          open={false}
          onOpenChange={() => undefined}
        />,
      );
    });

    expect(document.querySelector('[aria-label="Lignende produkter"]')).toBeNull();
    expect(document.querySelector('[data-testid="similar-product-grid"]')).toBeNull();
  });

  it('does not render similar products for a previous product after switching ids', () => {
    const previousProductId = '11111111-1111-1111-1111-111111111111';
    const nextProductId = '22222222-2222-2222-2222-222222222222';

    mockUseProduct.mockReturnValue({
      data: { ...baseProduct, id: nextProductId, name: 'Future Rider' },
      isLoading: false,
      isError: false,
      isFetched: true,
    } as ReturnType<typeof useProduct>);

    mockUseProductOffers.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useProductOffers>);

    mockUseSimilarProducts.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useSimilarProducts>);

    act(() => {
      root.render(
        <ProductDetailModal
          productId={previousProductId}
          open
          onOpenChange={() => undefined}
        />,
      );
    });

    act(() => {
      root.render(
        <ProductDetailModal
          productId={nextProductId}
          open
          onOpenChange={() => undefined}
        />,
      );
    });

    expect(document.querySelector('[aria-label="Lignende produkter"]')).toBeNull();
    expect(getModalText()).toContain('Future Rider');
    expect(getModalText()).not.toContain('Samba OG');
  });

  it('does not render a similar placeholder while the main product is loading', () => {
    mockUseProduct.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isFetched: false,
    } as ReturnType<typeof useProduct>);

    mockUseProductOffers.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useProductOffers>);

    mockUseSimilarProducts.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useSimilarProducts>);

    act(() => {
      root.render(
        <ProductDetailModal
          productId={productId}
          open
          onOpenChange={() => undefined}
        />,
      );
    });

    expect(document.querySelector('[aria-label="Lignende produkter"]')).toBeNull();
    expect(document.querySelector('[data-testid="product-similar-skeleton"]')).toBeNull();
    expect(getModalText()).toContain('Laster produkt');
  });
});
