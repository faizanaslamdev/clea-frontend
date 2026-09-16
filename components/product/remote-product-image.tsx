'use client';

import {
  useEffect,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import Image, { type ImageProps } from 'next/image';
import {
  advanceRemoteProductImagePhase,
  remoteProductImageRemountKey,
  remoteProductImageUnoptimized,
  type RemoteProductImagePhase,
} from '@/lib/ui/remote-product-image-phase';

type RemoteProductImageBase = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  draggable?: boolean;
  /** Rendered when both optimizer and direct CDN load fail. */
  fallback?: ReactNode;
};

type RemoteProductImageFillProps = RemoteProductImageBase & {
  fill: true;
  width?: never;
  height?: never;
};

type RemoteProductImageFixedProps = RemoteProductImageBase & {
  fill?: false;
  width: number;
  height: number;
};

export type RemoteProductImageProps =
  | RemoteProductImageFillProps
  | RemoteProductImageFixedProps;

/**
 * Merchant/product image with Vercel optimizer resilience:
 * optimized → same URL unoptimized (direct CDN) → fallback.
 * State is per mount/src; callers should render one instance per gallery src.
 */
export function RemoteProductImage({
  src,
  alt,
  className,
  sizes,
  priority = false,
  draggable,
  fallback = null,
  fill,
  width,
  height,
}: RemoteProductImageProps) {
  const [phase, setPhase] = useState<RemoteProductImagePhase>('optimized');

  useEffect(() => {
    setPhase('optimized');
  }, [src]);

  if (phase === 'failed') {
    return <>{fallback}</>;
  }

  const handleError = (_event: SyntheticEvent<HTMLImageElement>) => {
    setPhase((current) => advanceRemoteProductImagePhase(current));
  };

  const shared: Pick<
    ImageProps,
    'alt' | 'className' | 'sizes' | 'priority' | 'draggable' | 'onError' | 'unoptimized'
  > = {
    alt,
    className,
    sizes,
    priority,
    draggable,
    unoptimized: remoteProductImageUnoptimized(phase),
    onError: handleError,
  };

  if (fill) {
    return (
      <Image
        key={remoteProductImageRemountKey(src, phase)}
        src={src}
        fill
        {...shared}
      />
    );
  }

  return (
    <Image
      key={remoteProductImageRemountKey(src, phase)}
      src={src}
      width={width}
      height={height}
      {...shared}
    />
  );
}
