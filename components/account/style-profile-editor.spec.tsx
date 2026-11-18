import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StyleProfileEditor } from './style-profile-editor';

const saveStyleProfile = vi.fn();
vi.mock('@/lib/style-profile/style-profile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/style-profile/style-profile')>();
  return {
    ...actual,
    fetchStyleProfile: vi.fn().mockResolvedValue({ favouriteBrands: ['COS'], budgets: { bags: 2500 }, sizes: { shoes: '38' } }),
    saveStyleProfile: (profile: unknown) => saveStyleProfile(profile),
  };
});
vi.mock('@/lib/api/products', () => ({
  fetchCatalogBrands: vi.fn().mockResolvedValue([{ brand: 'Arket', productCount: 10 }]),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const flush = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};
const button = (name: RegExp) =>
  [...container.querySelectorAll('button')].find((b) => name.test(b.textContent ?? '') || name.test(b.getAttribute('aria-label') ?? ''))!;
const setInput = (input: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  setter.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
};
const stored = () => JSON.parse(window.localStorage.getItem('clea-style-profile') ?? '{}');

describe('StyleProfileEditor', () => {
  beforeEach(() => {
    window.localStorage.clear();
    saveStyleProfile.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('loads the account profile, adds a brand and saves the whole profile', async () => {
    saveStyleProfile.mockImplementation(async (profile) => profile);
    await act(async () => root.render(<StyleProfileEditor />));
    await flush();

    expect(container.textContent).toContain('COS');
    expect(container.textContent).toContain('Opptil 2 500 kr');

    const input = container.querySelector<HTMLInputElement>('.style-profile__input')!;
    await act(async () => setInput(input, 'Arket'));
    await act(async () => button(/^Legg til$/).click());
    expect(container.querySelector('.style-profile__brands')?.textContent).toContain('Arket');

    await act(async () => button(/Lagre stilprofil/).click());
    await flush();
    expect(saveStyleProfile).toHaveBeenCalledTimes(1);
    expect(saveStyleProfile.mock.calls[0][0]).toEqual({
      favouriteBrands: ['COS', 'Arket'],
      budgets: { bags: 2500 },
      sizes: { shoes: '38' },
    });
    expect(container.textContent).toContain('Lagret');
    expect(stored().favouriteBrands).toEqual(['COS', 'Arket']);
  });

  it('keeps the profile in the browser when saving to the account fails', async () => {
    saveStyleProfile.mockRejectedValue(new Error('503'));
    await act(async () => root.render(<StyleProfileEditor />));
    await flush();
    await act(async () => button(/Fjern COS/).click());
    await act(async () => button(/Lagre stilprofil/).click());
    await flush();
    expect(container.textContent).toContain('Profilen er lagret i denne nettleseren');
    expect(stored().favouriteBrands).toEqual([]);
  });
});
