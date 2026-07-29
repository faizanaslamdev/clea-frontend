import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SignInForm } from './sign-in-form';

const signInEmail = vi.fn();
const refetch = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@/components/auth/auth-provider', () => ({
  useAuthModal: () => ({ refreshPendingAction: vi.fn() }),
}));

vi.mock('@/lib/auth/client', () => ({
  signIn: { email: (...args: unknown[]) => signInEmail(...args) },
  useSession: () => ({ refetch }),
}));

describe('SignInForm', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
      true;
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    signInEmail.mockReset();
    refetch.mockReset();
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  async function renderForm() {
    await act(async () => {
      root.render(
        <SignInForm
          onSwitchToSignUp={vi.fn()}
          onForgotPassword={vi.fn()}
          onNeedsVerification={vi.fn()}
          onSuccess={vi.fn()}
        />,
      );
    });
  }

  async function setInput(input: HTMLInputElement, value: string) {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )?.set;
      setter?.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  it('keeps submit disabled for empty and invalid fields', async () => {
    await renderForm();
    const email = container.querySelector<HTMLInputElement>('#sign-in-email')!;
    const submit = container.querySelector<HTMLButtonElement>('button[type=submit]')!;

    expect(submit.disabled).toBe(true);
    await setInput(email, 'invalid');
    expect(submit.disabled).toBe(true);
    expect(signInEmail).not.toHaveBeenCalled();
  });

  it('toggles password visibility with an accessible button', async () => {
    await renderForm();
    const password =
      container.querySelector<HTMLInputElement>('#sign-in-password')!;
    const toggle = container.querySelector<HTMLButtonElement>(
      '[aria-label="Vis passord"]',
    )!;

    expect(password.type).toBe('password');
    await act(async () => toggle.click());
    expect(password.type).toBe('text');
    expect(
      container.querySelector('[aria-label="Skjul passord"]'),
    ).not.toBeNull();
  });

  it('prevents a second submission while the request is pending', async () => {
    let resolveRequest: ((value: { error: null }) => void) | undefined;
    signInEmail.mockReturnValue(
      new Promise<{ error: null }>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    refetch.mockResolvedValue(undefined);
    await renderForm();

    const email = container.querySelector<HTMLInputElement>('#sign-in-email')!;
    const password =
      container.querySelector<HTMLInputElement>('#sign-in-password')!;
    const form = container.querySelector('form')!;

    await setInput(email, 'user@example.com');
    await setInput(password, 'long-enough');

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(signInEmail).toHaveBeenCalledTimes(1);
    expect(
      container.querySelector<HTMLButtonElement>('button[type=submit]')?.disabled,
    ).toBe(true);

    await act(async () => resolveRequest?.({ error: null }));
  });
});
