import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatTypingIndicator } from './chat-typing-indicator';

describe('ChatTypingIndicator', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    container.remove();
    vi.useRealTimers();
  });

  it('starts on the first stage', () => {
    act(() => {
      root.render(<ChatTypingIndicator />);
    });
    expect(container.textContent).toContain('Søker');
  });

  it('advances through stages over time', () => {
    act(() => {
      root.render(<ChatTypingIndicator />);
    });

    act(() => {
      vi.advanceTimersByTime(2200);
    });
    expect(container.textContent).toContain('Sjekker priser');

    act(() => {
      vi.advanceTimersByTime(6000 - 2200);
    });
    expect(container.textContent).toContain('Snart klar');
  });

  it('clears its stage timers on unmount instead of updating state after unmount', () => {
    act(() => {
      root.render(<ChatTypingIndicator />);
    });

    act(() => {
      root.unmount();
    });

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(10_000);
      });
    }).not.toThrow();
  });
});
