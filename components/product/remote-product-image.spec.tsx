import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RemoteProductImage } from '@/components/product/remote-product-image';

const imagePropsLog: Array<{
  src?: string;
  unoptimized?: boolean;
  key?: string | null;
}> = [];

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
  }) => {
    imagePropsLog.push({
      src: typeof props.src === 'string' ? props.src : undefined,
      unoptimized,
    });
    return (
      <img
        {...props}
        data-unoptimized={unoptimized ? 'true' : 'false'}
        onError={onError}
      />
    );
  },
}));

describe('RemoteProductImage', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    imagePropsLog.length = 0;
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

  it('renders optimized and does not retry on success', () => {
    act(() => {
      root.render(
        <RemoteProductImage
          src="https://cdn.example/a.jpg"
          alt="A"
          width={100}
          height={100}
        />,
      );
    });

    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('data-unoptimized')).toBe('false');
    expect(img?.getAttribute('src')).toBe('https://cdn.example/a.jpg');
    expect(container.querySelector('[data-fallback]')).toBeNull();
  });

  it('retries the same src unoptimized after optimizer failure', () => {
    act(() => {
      root.render(
        <RemoteProductImage
          src="https://cdn.example/b.jpg"
          alt="B"
          width={100}
          height={100}
        />,
      );
    });

    const img = container.querySelector('img');
    act(() => {
      img?.dispatchEvent(new Event('error'));
    });

    const retried = container.querySelector('img');
    expect(retried?.getAttribute('src')).toBe('https://cdn.example/b.jpg');
    expect(retried?.getAttribute('data-unoptimized')).toBe('true');
  });

  it('shows fallback after optimized and direct both fail, with no third image retry', () => {
    act(() => {
      root.render(
        <RemoteProductImage
          src="https://cdn.example/c.jpg"
          alt="C"
          width={100}
          height={100}
          fallback={<div data-fallback="yes" />}
        />,
      );
    });

    act(() => {
      container.querySelector('img')?.dispatchEvent(new Event('error'));
    });
    act(() => {
      container.querySelector('img')?.dispatchEvent(new Event('error'));
    });

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[data-fallback="yes"]')).not.toBeNull();

    const errorCount = imagePropsLog.filter((entry) => entry.src === 'https://cdn.example/c.jpg')
      .length;
    // One optimized mount + one direct mount only.
    expect(errorCount).toBe(2);
  });

  it('resets to optimized when src changes', () => {
    act(() => {
      root.render(
        <RemoteProductImage
          src="https://cdn.example/one.jpg"
          alt="One"
          width={100}
          height={100}
        />,
      );
    });

    act(() => {
      container.querySelector('img')?.dispatchEvent(new Event('error'));
    });
    expect(container.querySelector('img')?.getAttribute('data-unoptimized')).toBe(
      'true',
    );

    act(() => {
      root.render(
        <RemoteProductImage
          src="https://cdn.example/two.jpg"
          alt="Two"
          width={100}
          height={100}
        />,
      );
    });

    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'https://cdn.example/two.jpg',
    );
    expect(container.querySelector('img')?.getAttribute('data-unoptimized')).toBe(
      'false',
    );
  });

  it('keeps independent phase state across two mounted sources', () => {
    act(() => {
      root.render(
        <>
          <RemoteProductImage
            src="https://cdn.example/left.jpg"
            alt="Left"
            width={72}
            height={96}
          />
          <RemoteProductImage
            src="https://cdn.example/right.jpg"
            alt="Right"
            width={72}
            height={96}
          />
        </>,
      );
    });

    const images = Array.from(container.querySelectorAll('img'));
    expect(images).toHaveLength(2);

    act(() => {
      images[0]?.dispatchEvent(new Event('error'));
    });

    const after = Array.from(container.querySelectorAll('img'));
    expect(after[0]?.getAttribute('src')).toBe('https://cdn.example/left.jpg');
    expect(after[0]?.getAttribute('data-unoptimized')).toBe('true');
    expect(after[1]?.getAttribute('src')).toBe('https://cdn.example/right.jpg');
    expect(after[1]?.getAttribute('data-unoptimized')).toBe('false');
  });
});
