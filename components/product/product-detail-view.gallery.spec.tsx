import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '@/lib/types';
import { RemoteProductImage } from '@/components/product/remote-product-image';
import { ProductDetailView } from '@/components/product/product-detail-view';

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

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      className,
      style,
      onDragEnd: _onDragEnd,
      drag: _drag,
      dragDirectionLock: _dragDirectionLock,
      dragElastic: _dragElastic,
      dragMomentum: _dragMomentum,
      dragConstraints: _dragConstraints,
      custom: _custom,
      variants: _variants,
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    ),
  },
  useReducedMotion: () => true,
}));

vi.mock('@/components/chat/chat-anchor-provider', () => ({
  useChatAnchorConnection: () => null,
}));

vi.mock('@/lib/hooks/useEngagementTracking', () => ({
  useEngagementTracking: () => ({
    trackDetailView: vi.fn(),
    trackOutboundClick: vi.fn(),
    trackCardClick: vi.fn(),
  }),
}));

vi.mock('@/components/product/product-card-anchor-menu', () => ({
  ProductCardAnchorMenu: () => null,
}));

vi.mock('@/components/auth/notify-me-button', () => ({
  NotifyMeButton: () => null,
}));

vi.mock('@/components/product-grid', () => ({
  ProductGrid: () => null,
}));

vi.mock('@/components/product/product-best-prices', () => ({
  ProductBestPrices: () => null,
  ProductBestPricesError: () => null,
  ProductBestPricesSkeleton: () => null,
}));

const MAIN =
  'https://cdn.occtoo-media.com/995/main.jpg?format=medium&outputFormat=webp';
const ALT_B =
  'https://cdn.occtoo-media.com/995/alt-b.jpg?format=medium&outputFormat=webp';
const ALT_C =
  'https://cdn.occtoo-media.com/995/alt-c.jpg?format=medium&outputFormat=webp';

const PRODUCT: Product = {
  id: '8f2df798-1cc8-426f-b287-e173d90bb54d',
  name: 'Her Sense',
  brand: 'viking',
  image: MAIN,
  images: [MAIN, ALT_B, ALT_C],
  category: 'Fashion',
  description: 'Her Sense er en lett sneakers til dame.',
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
};

vi.mock('@/lib/hooks/useProducts', () => ({
  useProduct: () => ({
    data: PRODUCT,
    isLoading: false,
    isError: false,
    isFetched: true,
  }),
  useSimilarProducts: () => ({ data: [], isLoading: false }),
  useProductOffers: () => ({
    data: { compareReady: false, offers: [] },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/components/product/remote-product-image', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/components/product/remote-product-image')>();
  return {
    RemoteProductImage: vi.fn((props) => actual.RemoteProductImage(props)),
  };
});

describe('ProductDetailView gallery RemoteProductImage wiring', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.mocked(RemoteProductImage).mockClear();
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

  function renderModal() {
    act(() => {
      root.render(
        <ProductDetailView
          productId={PRODUCT.id}
          presentation="modal"
          onClose={vi.fn()}
        />,
      );
    });
  }

  it('wires gallery role on main and thumb role on thumbnails', () => {
    renderModal();

    const calls = vi.mocked(RemoteProductImage).mock.calls.map(([props]) => props);
    const main = calls.find(
      (props) =>
        props.className === 'product-detail-modal__gallery-image' &&
        props.src === MAIN,
    );
    expect(main).toBeDefined();
    expect(main?.priority).toBe(true);
    expect(main?.role).toBe('gallery');

    const thumbs = calls.filter(
      (props) => props.className === 'product-detail-modal__thumb-image',
    );
    expect(thumbs.map((props) => props.src)).toEqual([MAIN, ALT_B, ALT_C]);
    expect(thumbs.every((props) => props.role === 'thumb')).toBe(true);
  });

  it('renders Occtoo gallery main without format (full quality)', () => {
    renderModal();

    const main = container.querySelector(
      'img.product-detail-modal__gallery-image',
    );
    expect(main?.getAttribute('data-unoptimized')).toBe('true');
    expect(main?.getAttribute('src')).not.toMatch(/[?&]format=/);
    expect(main?.getAttribute('src')).toContain('outputFormat=webp');
  });

  it('falls back sized → base for thumbs that transform, then placeholder', () => {
    renderModal();

    const thumbs = Array.from(
      container.querySelectorAll('img.product-detail-modal__thumb-image'),
    );
    expect(thumbs[0]?.getAttribute('src')).toContain('format=medium');

    act(() => {
      thumbs[0]?.dispatchEvent(new Event('error'));
    });

    const after = Array.from(
      container.querySelectorAll('img.product-detail-modal__thumb-image'),
    );
    expect(after[0]?.getAttribute('src')).not.toMatch(/[?&]format=/);
    expect(after[1]?.getAttribute('src')).toContain('format=medium');
  });

  it('renders muted gallery placeholder after base failure', () => {
    renderModal();

    // Gallery Occtoo sized === base (no format) → single failure → placeholder
    act(() => {
      container
        .querySelector('img.product-detail-modal__gallery-image')
        ?.dispatchEvent(new Event('error'));
    });

    expect(
      container.querySelector('img.product-detail-modal__gallery-image'),
    ).toBeNull();
    expect(
      container.querySelector(
        '.product-detail-modal__gallery-image--fallback',
      ),
    ).not.toBeNull();
  });

  it('does not retain FAILED state when selecting a different gallery image', () => {
    renderModal();

    act(() => {
      container
        .querySelector('img.product-detail-modal__gallery-image')
        ?.dispatchEvent(new Event('error'));
    });
    expect(
      container.querySelector(
        '.product-detail-modal__gallery-image--fallback',
      ),
    ).not.toBeNull();

    const nextThumb = container.querySelector(
      'button.product-detail-modal__thumb[aria-label="Bilde 2 av 3"]',
    );
    expect(nextThumb).not.toBeNull();
    act(() => {
      nextThumb?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const main = container.querySelector(
      'img.product-detail-modal__gallery-image',
    );
    expect(main?.getAttribute('src')).toContain('alt-b.jpg');
    expect(main?.getAttribute('src')).not.toMatch(/[?&]format=/);
    expect(main?.getAttribute('data-unoptimized')).toBe('true');
    expect(nextThumb?.getAttribute('aria-current')).toBe('true');
  });

  it('keeps gallery nav and thumb selection controls available', () => {
    renderModal();

    expect(
      container.querySelector(
        'button.product-detail-modal__gallery-nav--next',
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(
        'button.product-detail-modal__gallery-nav--prev',
      ),
    ).not.toBeNull();
    expect(
      container.querySelectorAll('button.product-detail-modal__gallery-dot'),
    ).toHaveLength(3);
    expect(
      container.querySelectorAll('button.product-detail-modal__thumb'),
    ).toHaveLength(3);

    act(() => {
      container
        .querySelector('button.product-detail-modal__gallery-nav--next')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(
      container
        .querySelector('img.product-detail-modal__gallery-image')
        ?.getAttribute('src'),
    ).toContain('alt-b.jpg');
    expect(
      container
        .querySelector('button.product-detail-modal__thumb[aria-current="true"]')
        ?.getAttribute('aria-label'),
    ).toBe('Bilde 2 av 3');
  });
});
