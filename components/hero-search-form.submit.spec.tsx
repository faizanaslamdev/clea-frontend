/** @vitest-environment jsdom */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HeroSearchForm } from '@/components/hero-search-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

describe('HeroSearchForm compact submitRequiresText', () => {
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

  it('disables send until text is present when submitRequiresText is set', () => {
    let value = '';
    const onValueChange = vi.fn((next: string) => {
      value = next;
      act(() => {
        root.render(
          <HeroSearchForm
            variant="compact"
            value={value}
            onValueChange={onValueChange}
            submitRequiresText
            onSubmitQuery={vi.fn()}
          />,
        );
      });
    });

    act(() => {
      root.render(
        <HeroSearchForm
          variant="compact"
          value={value}
          onValueChange={onValueChange}
          submitRequiresText
          onSubmitQuery={vi.fn()}
        />,
      );
    });

    const submit = () =>
      container.querySelector(
        '.hero-search-bar--compact__submit',
      ) as HTMLButtonElement;

    expect(submit().disabled).toBe(true);
    expect(
      submit().classList.contains('hero-search-bar--compact__submit--active'),
    ).toBe(false);

    const input = container.querySelector(
      '.hero-search-bar--compact__input',
    ) as HTMLTextAreaElement;

    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set;
      setter?.call(input, 'svart jakke');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(onValueChange).toHaveBeenCalledWith('svart jakke');
    expect(submit().disabled).toBe(false);
    expect(
      submit().classList.contains('hero-search-bar--compact__submit--active'),
    ).toBe(true);
  });
});
