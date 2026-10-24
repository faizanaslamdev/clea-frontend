import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SectionErrorBoundary } from './section-error-boundary';

const captureException = vi.fn();
vi.mock('@sentry/nextjs', () => ({
  withScope: (fn: (scope: unknown) => void) =>
    fn({ setTag: vi.fn(), setExtra: vi.fn() }),
  captureException: (error: unknown) => captureException(error),
}));

function Boom({ fail }: { fail: boolean }) {
  if (fail) throw new Error('similar products failed to render');
  return <p>similar products</p>;
}

describe('SectionErrorBoundary', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    captureException.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.restoreAllMocks();
  });

  it('keeps a failing section from taking the rest of the page down', () => {
    act(() =>
      root.render(
        <main>
          <h1>Kjole</h1>
          <SectionErrorBoundary name="similar-products">
            <Boom fail />
          </SectionErrorBoundary>
          <p>Kjøp hos butikken</p>
        </main>,
      ),
    );
    expect(container.textContent).toContain('Kjole');
    expect(container.textContent).toContain('Kjøp hos butikken');
    expect(container.textContent).not.toContain('similar products');
    expect(captureException).toHaveBeenCalledTimes(1);
  });

  it('shows the fallback and retries when the reset key changes', () => {
    const render = (id: string, fail: boolean) =>
      act(() =>
        root.render(
          <SectionErrorBoundary
            name="product-modal"
            resetKeys={[id]}
            fallback={<p>Vi kunne ikke vise dette produktet</p>}
          >
            <Boom fail={fail} />
          </SectionErrorBoundary>,
        ),
      );
    render('a', true);
    expect(container.textContent).toContain('Vi kunne ikke vise');
    render('b', false);
    expect(container.textContent).toContain('similar products');
  });
});
