/** @vitest-environment jsdom */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductCardAnchorMenu } from '@/components/product/product-card-anchor-menu';
import type { Product } from '@/lib/types';

const startProductChatAnchorAction = vi.fn();
const startProductChatFromAnchor = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('@/components/chat/chat-anchor-provider', () => ({
  useChatAnchorConnection: () => null,
}));

vi.mock('@/lib/chat/start-product-chat', () => ({
  startProductChatAnchorAction: (...args: unknown[]) =>
    startProductChatAnchorAction(...args),
  startProductChatFromAnchor: (...args: unknown[]) =>
    startProductChatFromAnchor(...args),
}));

vi.mock('@/components/product/remote-product-image', () => ({
  RemoteProductImage: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="context-image" />
  ),
}));

vi.mock('@/lib/navigation/ai-anchor-surface', async () => {
  const actual = await vi.importActual<
    typeof import('@/lib/navigation/ai-anchor-surface')
  >('@/lib/navigation/ai-anchor-surface');
  return {
    ...actual,
    resolveAiAnchorSurface: vi.fn(actual.resolveAiAnchorSurface),
  };
});

import { resolveAiAnchorSurface } from '@/lib/navigation/ai-anchor-surface';

const PRODUCT = {
  id: 'prod-1',
  name: 'Test Jacket',
  brand: 'Clea Test',
  image: 'https://cdn.example.com/jacket.jpg',
  category: 'Fashion',
  description: '',
  sku: 'x',
  matchType: 'exact',
  rating: 0,
  reviewCount: 0,
  prices: { m1: 1299 },
  priceHistory: [],
  inStock: { m1: true },
  lowestPrice: 1299,
  highestPrice: 1299,
  averagePrice: 1299,
  savingsPercent: 0,
  trending: false,
  trendingScore: 0,
  currency: 'NOK',
  merchantName: 'Test Shop',
} as Product;

describe('ProductCardAnchorMenu surfaces', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    startProductChatAnchorAction.mockReset();
    startProductChatFromAnchor.mockReset();
    vi.mocked(resolveAiAnchorSurface).mockReset();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('opens a bottom sheet with product context below desktop breakpoint', () => {
    vi.mocked(resolveAiAnchorSurface).mockReturnValue('sheet');

    act(() => {
      root.render(<ProductCardAnchorMenu product={PRODUCT} />);
    });

    const trigger = container.querySelector(
      '.product-card-anchor-menu__trigger',
    ) as HTMLButtonElement;
    act(() => {
      trigger.click();
    });

    expect(
      document.querySelector('.product-card-anchor-menu__sheet'),
    ).toBeTruthy();
    expect(
      document.querySelector('.product-card-anchor-menu__popover'),
    ).toBeNull();
    expect(
      document.querySelector('.product-anchor-context-card__title')?.textContent,
    ).toBe('Test Jacket');
    expect(
      document.querySelector('.product-card-anchor-menu__sheet-close'),
    ).toBeTruthy();
    expect(
      document.querySelector(
        '.product-card-anchor-menu__sheet .hero-search-bar--compact__input',
      ),
    ).toBeTruthy();
  });

  it('keeps the floating popover on desktop without product context card', () => {
    vi.mocked(resolveAiAnchorSurface).mockReturnValue('popover');

    act(() => {
      root.render(<ProductCardAnchorMenu product={PRODUCT} />);
    });

    const trigger = container.querySelector(
      '.product-card-anchor-menu__trigger',
    ) as HTMLButtonElement;
    act(() => {
      trigger.click();
    });

    expect(
      document.querySelector('.product-card-anchor-menu__popover'),
    ).toBeTruthy();
    expect(
      document.querySelector('.product-card-anchor-menu__sheet'),
    ).toBeNull();
    expect(document.querySelector('.product-anchor-context-card')).toBeNull();
  });

  it('submits Vis lignende through the existing product-chat path from the sheet', () => {
    vi.mocked(resolveAiAnchorSurface).mockReturnValue('sheet');

    act(() => {
      root.render(<ProductCardAnchorMenu product={PRODUCT} />);
    });

    act(() => {
      (
        container.querySelector(
          '.product-card-anchor-menu__trigger',
        ) as HTMLButtonElement
      ).click();
    });

    const similar = Array.from(
      document.querySelectorAll('.product-card-anchor-menu__pill'),
    ).find((node) => node.textContent === 'Vis lignende') as HTMLButtonElement;

    act(() => {
      similar.click();
    });

    expect(startProductChatAnchorAction).toHaveBeenCalledWith(
      expect.anything(),
      'prod-1',
      'similar',
      expect.objectContaining({ productId: 'prod-1', name: 'Test Jacket' }),
      undefined,
    );
  });

  it('wires submitRequiresText so the sheet send control starts disabled', () => {
    vi.mocked(resolveAiAnchorSurface).mockReturnValue('sheet');

    act(() => {
      root.render(<ProductCardAnchorMenu product={PRODUCT} />);
    });

    act(() => {
      (
        container.querySelector(
          '.product-card-anchor-menu__trigger',
        ) as HTMLButtonElement
      ).click();
    });

    const submit = document.querySelector(
      '.product-card-anchor-menu__composer .hero-search-bar--compact__submit',
    ) as HTMLButtonElement;

    expect(submit.disabled).toBe(true);
    expect(
      submit.classList.contains('hero-search-bar--compact__submit--active'),
    ).toBe(false);
  });
});
