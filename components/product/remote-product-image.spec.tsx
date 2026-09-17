import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RemoteProductImage } from '@/components/product/remote-product-image';

const imagePropsLog: Array<{
  src?: string;
  unoptimized?: boolean;
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

const OCCTOO =
  'https://cdn.occtoo-media.com/995/abc/product.jpg?format=medium&outputFormat=webp';

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

  it('renders merchant-sized URL unoptimized for card role', () => {
    act(() => {
      root.render(
        <RemoteProductImage
          src={OCCTOO}
          alt="A"
          role="card"
          width={100}
          height={100}
        />,
      );
    });

    const img = container.querySelector('img');
    expect(img?.getAttribute('data-unoptimized')).toBe('true');
    expect(img?.getAttribute('src')).toContain('format=large');
    expect(img?.getAttribute('src')).toContain('outputFormat=webp');
  });

  it('falls back from sized → base when transform differs', () => {
    act(() => {
      root.render(
        <RemoteProductImage
          src={OCCTOO}
          alt="B"
          role="card"
          width={100}
          height={100}
        />,
      );
    });

    act(() => {
      container.querySelector('img')?.dispatchEvent(new Event('error'));
    });

    const retried = container.querySelector('img');
    expect(retried?.getAttribute('src')).not.toMatch(/[?&]format=/);
    expect(retried?.getAttribute('src')).toContain('outputFormat=webp');
    expect(retried?.getAttribute('data-unoptimized')).toBe('true');
  });

  it('shows fallback after sized and base both fail', () => {
    act(() => {
      root.render(
        <RemoteProductImage
          src={OCCTOO}
          alt="C"
          role="card"
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
  });

  it('does not duplicate-retry when sized === base', () => {
    act(() => {
      root.render(
        <RemoteProductImage
          src="https://cdn.example/c.jpg"
          alt="C"
          role="card"
          width={100}
          height={100}
          fallback={<div data-fallback="yes" />}
        />,
      );
    });

    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      'https://cdn.example/c.jpg',
    );

    act(() => {
      container.querySelector('img')?.dispatchEvent(new Event('error'));
    });

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[data-fallback="yes"]')).not.toBeNull();
    expect(
      imagePropsLog.filter((entry) => entry.src === 'https://cdn.example/c.jpg'),
    ).toHaveLength(1);
  });

  it('resets failure state when src or role changes', () => {
    act(() => {
      root.render(
        <RemoteProductImage
          src={OCCTOO}
          alt="One"
          role="card"
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
    expect(container.querySelector('[data-fallback="yes"]')).not.toBeNull();

    act(() => {
      root.render(
        <RemoteProductImage
          src={OCCTOO}
          alt="One"
          role="thumb"
          width={100}
          height={100}
          fallback={<div data-fallback="yes" />}
        />,
      );
    });

    expect(container.querySelector('img')?.getAttribute('src')).toContain(
      'format=medium',
    );
    expect(container.querySelector('[data-fallback="yes"]')).toBeNull();
  });

  it('keeps independent phase state across two mounted sources', () => {
    const left =
      'https://cdn.occtoo-media.com/a/left.jpg?format=medium&outputFormat=webp';
    const right =
      'https://cdn.occtoo-media.com/a/right.jpg?format=medium&outputFormat=webp';

    act(() => {
      root.render(
        <>
          <RemoteProductImage
            src={left}
            alt="Left"
            role="card"
            width={72}
            height={96}
          />
          <RemoteProductImage
            src={right}
            alt="Right"
            role="card"
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
    expect(after[0]?.getAttribute('src')).not.toMatch(/[?&]format=/);
    expect(after[1]?.getAttribute('src')).toContain('format=large');
  });
});
