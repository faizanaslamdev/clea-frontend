import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatAnchorUserBubble } from '@/components/search/chat-anchor-user-bubble';

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
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock('@/components/product/product-desktop-modal-provider', () => ({
  useProductDesktopModal: () => ({
    openProductModal: vi.fn(),
    closeProductModal: vi.fn(),
    isProductModalOpen: false,
  }),
}));

describe('ChatAnchorUserBubble image ladder', () => {
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

  it('retries direct CDN before placeholder on optimizer failure', () => {
    act(() => {
      root.render(
        <ChatAnchorUserBubble
          preview={{
            productId: '11111111-1111-4111-8111-111111111111',
            name: 'Her Sense',
            image: 'https://cdn.example/her-sense.jpg',
            brand: 'viking',
          }}
          actionLabel="Vis lignende produkter"
        />,
      );
    });

    expect(container.querySelector('img')?.getAttribute('data-unoptimized')).toBe(
      'false',
    );

    act(() => {
      container.querySelector('img')?.dispatchEvent(new Event('error'));
    });

    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'https://cdn.example/her-sense.jpg',
    );
    expect(container.querySelector('img')?.getAttribute('data-unoptimized')).toBe(
      'true',
    );

    act(() => {
      container.querySelector('img')?.dispatchEvent(new Event('error'));
    });

    expect(container.querySelector('img')).toBeNull();
    expect(
      container.querySelector('.search-chat-anchor-ref__image-wrap--empty'),
    ).not.toBeNull();
  });
});
