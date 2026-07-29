import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotifyMeButton } from './notify-me-button';

const productId = '0f3a12be-35bb-4de3-83ea-f6cc5f44ca01';
const createTrack = vi.fn();
const stopTrack = vi.fn();
let tracking = false;

vi.mock('next/navigation', () => ({
  usePathname: () => '/products',
}));

vi.mock('@/components/auth/auth-provider', () => ({
  useAuthModal: () => ({
    openAuthModal: vi.fn(),
    clearPendingActionAfterSuccess: vi.fn(),
    refreshPendingAction: vi.fn(),
  }),
}));

vi.mock('@/lib/auth/client', () => ({
  useSession: () => ({
    data: { user: { emailVerified: true } },
    isPending: false,
  }),
}));

vi.mock('@/lib/hooks/useTracks', () => ({
  useTrackByProduct: () => ({
    data: tracking
      ? { tracking: true, track: { id: 'track-1' } }
      : { tracking: false, track: null },
    isLoading: false,
  }),
  useCreateTrack: () => ({
    mutateAsync: createTrack,
    isPending: false,
  }),
  useStopTrack: () => ({
    mutateAsync: stopTrack,
    isPending: false,
  }),
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('NotifyMeButton', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
      true;
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    tracking = false;
    createTrack.mockReset();
    stopTrack.mockReset();
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  async function renderButton() {
    await act(async () => {
      root.render(<NotifyMeButton productId={productId} />);
    });
    return container.querySelector<HTMLButtonElement>('button')!;
  }

  it('shows an immediate optimistic confirmation and blocks repeat clicks', async () => {
    const request = deferred<{ alreadyTracking?: boolean }>();
    createTrack.mockReturnValue(request.promise);
    const button = await renderButton();

    await act(async () => {
      button.click();
      button.click();
    });

    expect(button.textContent).toContain('Prisvarsel lagt til');
    expect(button.disabled).toBe(true);
    expect(createTrack).toHaveBeenCalledTimes(1);

    await act(async () => request.resolve({ alreadyTracking: false }));
    expect(container.textContent).toContain('Vi følger prisen');
  });

  it('rolls back the optimistic state and shows an inline error', async () => {
    const request = deferred<never>();
    createTrack.mockReturnValue(request.promise);
    const button = await renderButton();

    await act(async () => button.click());
    expect(button.textContent).toContain('Prisvarsel lagt til');

    await act(async () => request.reject(new Error('network')));
    expect(button.textContent).toContain('Varsle meg ved prisfall');
    expect(container.textContent).toContain(
      'Kunne ikke starte prisvarsling. Prøv igjen.',
    );
  });

  it('optimistically confirms removal before the API responds', async () => {
    tracking = true;
    const request = deferred<unknown>();
    stopTrack.mockReturnValue(request.promise);
    const button = await renderButton();

    await act(async () => button.click());
    expect(button.textContent).toContain('Prisvarsel fjernet');
    expect(button.disabled).toBe(true);

    await act(async () => request.resolve({}));
    expect(container.textContent).toContain('Prisvarsling er stoppet.');
  });
});
