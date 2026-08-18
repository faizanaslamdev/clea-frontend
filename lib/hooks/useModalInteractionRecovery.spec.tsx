import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isCoarsePointerDevice,
  isEditableFocused,
  isLikelySystemOverlayViewportChange,
  useModalInteractionRecovery,
} from './useModalInteractionRecovery';

function enableCoarsePointerEnvironment() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
  Object.defineProperty(navigator, 'maxTouchPoints', {
    configurable: true,
    value: 1,
  });
}

function TestHarness({ open }: { open: boolean }) {
  const epoch = useModalInteractionRecovery(open);
  return <div data-testid="epoch">{epoch}</div>;
}

describe('useModalInteractionRecovery helpers', () => {
  beforeEach(() => {
    enableCoarsePointerEnvironment();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('detects coarse pointer devices', () => {
    expect(isCoarsePointerDevice()).toBe(true);
  });

  it('returns false on fine pointer devices without touch', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 0,
    });

    expect(isCoarsePointerDevice()).toBe(false);
  });

  it('detects editable focus', () => {
    const input = document.createElement('input');
    document.body.append(input);
    input.focus();
    expect(isEditableFocused()).toBe(true);
  });

  it('detects screenshot-sized visual viewport overlays', () => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: {
        height: 720,
        offsetTop: 0,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    expect(isLikelySystemOverlayViewportChange()).toBe(true);
  });

  it('ignores keyboard-sized visual viewport overlays', () => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: {
        height: 500,
        offsetTop: 0,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    expect(isLikelySystemOverlayViewportChange()).toBe(false);
  });

  it('ignores URL-bar-only viewport changes without overlay chrome', () => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: {
        height: 800,
        offsetTop: 40,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    expect(isLikelySystemOverlayViewportChange()).toBe(false);
  });
});

describe('useModalInteractionRecovery', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
      true;
    enableCoarsePointerEnvironment();
    container = document.createElement('div');
    document.body.append(container);
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      writable: true,
      value: 'visible',
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: {
        height: 800,
        offsetTop: 0,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
  });

  afterEach(async () => {
    await act(async () => root?.unmount());
    container.remove();
    vi.restoreAllMocks();
  });

  async function renderHarness(open = true) {
    await act(async () => {
      root = createRoot(container);
      root.render(<TestHarness open={open} />);
    });
    return container.querySelector('[data-testid="epoch"]');
  }

  function epochValue(node: Element | null): number {
    return Number(node?.textContent ?? '0');
  }

  it('bumps epoch when visibility returns from hidden', async () => {
    const node = await renderHarness(true);
    expect(epochValue(node)).toBe(0);

    await act(async () => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));

      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'visible',
      });
      document.dispatchEvent(new Event('visibilitychange'));
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    expect(epochValue(node)).toBe(1);
  });

  it('bumps epoch on focus after blur while the page stayed visible', async () => {
    const node = await renderHarness(true);

    await act(async () => {
      window.dispatchEvent(new Event('blur'));
      window.dispatchEvent(new Event('focus'));
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    expect(epochValue(node)).toBe(1);
  });

  it('bumps epoch on screenshot-sized visualViewport resize while visible', async () => {
    const listeners = new Map<string, EventListener>();
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: {
        height: 800,
        offsetTop: 0,
        addEventListener: (type: string, listener: EventListener) => {
          listeners.set(type, listener);
        },
        removeEventListener: (type: string) => {
          listeners.delete(type);
        },
      },
    });

    const node = await renderHarness(true);

    await act(async () => {
      Object.defineProperty(window.visualViewport!, 'height', {
        configurable: true,
        value: 710,
      });
      listeners.get('resize')?.(new Event('resize'));
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    expect(epochValue(node)).toBe(1);
  });

  it('does not bump epoch for keyboard-sized viewport changes while typing', async () => {
    const listeners = new Map<string, EventListener>();
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: {
        height: 800,
        offsetTop: 0,
        addEventListener: (type: string, listener: EventListener) => {
          listeners.set(type, listener);
        },
        removeEventListener: (type: string) => {
          listeners.delete(type);
        },
      },
    });

    const input = document.createElement('input');
    document.body.append(input);
    input.focus();

    const node = await renderHarness(true);

    await act(async () => {
      Object.defineProperty(window.visualViewport!, 'height', {
        configurable: true,
        value: 500,
      });
      listeners.get('resize')?.(new Event('resize'));
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    expect(epochValue(node)).toBe(0);
  });

  it('does not register recovery listeners when the modal is closed', async () => {
    const addListener = vi.fn();
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: {
        height: 800,
        offsetTop: 0,
        addEventListener: addListener,
        removeEventListener: vi.fn(),
      },
    });

    await renderHarness(false);
    expect(addListener).not.toHaveBeenCalled();
  });

  it('coalesces blur, focus, and viewport signals into a single recovery bump', async () => {
    const listeners = new Map<string, EventListener>();
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: {
        height: 800,
        offsetTop: 0,
        addEventListener: (type: string, listener: EventListener) => {
          listeners.set(type, listener);
        },
        removeEventListener: (type: string) => {
          listeners.delete(type);
        },
      },
    });

    const node = await renderHarness(true);

    await act(async () => {
      window.dispatchEvent(new Event('blur'));
      window.dispatchEvent(new Event('focus'));
      Object.defineProperty(window.visualViewport!, 'height', {
        configurable: true,
        value: 710,
      });
      listeners.get('resize')?.(new Event('resize'));
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    expect(epochValue(node)).toBe(1);
  });
});
