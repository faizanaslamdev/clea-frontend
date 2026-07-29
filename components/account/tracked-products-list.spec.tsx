import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TrackedProductsList } from './tracked-products-list';

const mutateAsync = vi.fn();
const refetch = vi.fn();
let tracksQuery: Record<string, unknown>;

vi.mock('next/image', () => ({
  default: ({
    fill: _fill,
    unoptimized: _unoptimized,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    unoptimized?: boolean;
  }) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock('@/lib/auth/client', () => ({
  useSession: () => ({
    data: { user: { emailVerified: true } },
    isPending: false,
  }),
}));

vi.mock('@/lib/hooks/useTracks', () => ({
  useActiveTracks: () => tracksQuery,
  useStopTrack: () => ({
    mutateAsync,
    isPending: false,
    variables: undefined,
  }),
}));

const track = {
  id: 'track-1',
  productId: 'product-1',
  identityKey: 'merchant:sku',
  merchantId: 'merchant',
  currency: 'NOK',
  priceAtTrack: 1_499,
  lastNotifiedPrice: null,
  lastNotifiedAt: null,
  status: 'active',
  createdAt: '2026-07-20T12:00:00.000Z',
  stoppedAt: null,
  product: {
    id: 'product-1',
    identityKey: 'merchant:sku',
    name: 'Editorial Wool Coat',
    brand: 'Nelly',
    imageUrl: 'https://example.com/coat.jpg',
    merchantName: 'nelly.com',
    merchantId: 'merchant',
    deepLink: 'https://example.com/product',
    currentPrice: 999,
    currency: 'NOK',
  },
};

describe('TrackedProductsList', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
      true;
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    mutateAsync.mockReset();
    refetch.mockReset();
    tracksQuery = {
      data: [track],
      isLoading: false,
      isError: false,
      refetch,
    };
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
    container.remove();
  });

  async function renderList() {
    await act(async () => root.render(<TrackedProductsList />));
  }

  it('renders product details, prices and actions', async () => {
    await renderList();
    expect(container.textContent).toContain('Editorial Wool Coat');
    expect(container.textContent).toContain('nelly.com');
    expect(container.textContent).toContain('999');
    expect(container.textContent).toContain('1 499');
    expect(container.textContent).toContain('Se produkt');
    expect(container.textContent).toContain('Stopp varsel');
  });

  it('renders an actionable empty state', async () => {
    tracksQuery.data = [];
    await renderList();
    expect(container.textContent).toContain('Ingen prisvarsler ennå');
    expect(container.querySelector('a[href="/brands"]')).not.toBeNull();
  });

  it('renders an error state with retry', async () => {
    tracksQuery.isError = true;
    await renderList();
    const retry = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Prøv igjen'),
    )!;
    await act(async () => retry.click());
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('removes a track and reports success', async () => {
    mutateAsync.mockResolvedValue(track);
    await renderList();
    const remove = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Stopp varsel'),
    )!;
    await act(async () => remove.click());
    expect(mutateAsync).toHaveBeenCalledWith('track-1');
    expect(container.textContent).toContain('er stoppet');
  });

  it('restores feedback when removal fails', async () => {
    mutateAsync.mockRejectedValue(new Error('network'));
    await renderList();
    const remove = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Stopp varsel'),
    )!;
    await act(async () => remove.click());
    expect(container.textContent).toContain('Produktet er fortsatt i listen');
  });
});
