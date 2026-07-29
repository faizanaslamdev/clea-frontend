import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from './header';

const openAuthModal = vi.fn();
let sessionState: {
  data: { user: { name?: string } } | null;
  isPending: boolean;
};

vi.mock('next/navigation', () => ({
  usePathname: () => '/about',
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock('@/components/brand-logo', () => ({
  BrandLogo: () => <a href="/">Clea</a>,
}));

vi.mock('@/components/hero-search-form', () => ({
  HeroSearchForm: () => null,
}));

vi.mock('@/components/auth/auth-provider', () => ({
  useAuthModal: () => ({ openAuthModal }),
}));

vi.mock('@/lib/auth/client', () => ({
  useSession: () => sessionState,
}));

describe('Header authentication entry', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
      true;
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    openAuthModal.mockReset();
    sessionState = { data: null, isPending: false };
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('opens the existing sign-in modal for visitors', async () => {
    await act(async () => root.render(<Header />));

    const login = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Logg inn på Clea"]',
    );
    expect(login?.textContent).toContain('Logg inn');

    await act(async () => login?.click());
    expect(openAuthModal).toHaveBeenCalledWith({ view: 'sign-in' });
  });

  it('immediately replaces login with the account link after authentication', async () => {
    await act(async () => root.render(<Header />));
    expect(container.textContent).toContain('Logg inn');

    sessionState = {
      data: { user: { name: 'Ada' } },
      isPending: false,
    };
    await act(async () => root.render(<Header />));

    expect(container.querySelector('button[aria-label="Logg inn på Clea"]')).toBeNull();
    const account = container.querySelector<HTMLAnchorElement>('a[href="/account"]');
    expect(account?.textContent).toContain('Min konto');
    expect(account?.getAttribute('aria-label')).toContain('Ada');
  });
});
