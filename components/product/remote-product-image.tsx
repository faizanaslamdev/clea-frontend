'use client';

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import Image, { type ImageProps } from 'next/image';
import {
  advanceRemoteProductImagePhase,
  initialRemoteProductImagePhase,
  remoteProductImageRemountKey,
  remoteProductImageSrcForPhase,
  remoteProductImageUnoptimized,
  type RemoteProductImagePhase,
} from '@/lib/ui/remote-product-image-phase';
import {
  getMerchantImageBaseUrl,
  resolveMerchantImageUrl,
  type ProductImageRole,
} from '@/lib/utils/merchant-image-url';

type RemoteProductImageBase = {
  src: string;
  alt: string;
  /** Merchant CDN sizing role; omit only for non-catalog/experimental callers. */
  role?: ProductImageRole;
  className?: string;
  sizes?: string;
  priority?: boolean;
  draggable?: boolean;
  /** Rendered when sized and base CDN loads both fail. */
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
 * Merchant/product image with CDN sizing + resilience:
 * merchant-sized URL → unsized/base URL → fallback.
 * Always unoptimized (Vercel Image Optimization disabled).
 */
export function RemoteProductImage({
  src,
  alt,
  role = 'card',
  className,
  sizes,
  priority = false,
  draggable,
  fallback = null,
  fill,
  width,
  height,
}: RemoteProductImageProps) {
  const baseSrc = useMemo(() => getMerchantImageBaseUrl(src), [src]);
  const sizedSrc = useMemo(
    () => resolveMerchantImageUrl(src, role),
    [src, role],
  );

  const [phase, setPhase] = useState<RemoteProductImagePhase>(() =>
    initialRemoteProductImagePhase(sizedSrc, baseSrc),
  );

  useEffect(() => {
    setPhase(initialRemoteProductImagePhase(sizedSrc, baseSrc));
  }, [src, role, sizedSrc, baseSrc]);

  if (phase === 'failed') {
    return <>{fallback}</>;
  }

  const displaySrc = remoteProductImageSrcForPhase(phase, sizedSrc, baseSrc);

  const handleError = (_event: SyntheticEvent<HTMLImageElement>) => {
    setPhase((current) =>
      advanceRemoteProductImagePhase(current, sizedSrc, baseSrc),
    );
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
        key={remoteProductImageRemountKey(displaySrc, phase)}
        src={displaySrc}
        fill
        {...shared}
      />
    );
  }

  return (
    <Image
      key={remoteProductImageRemountKey(displaySrc, phase)}
      src={displaySrc}
      width={width}
      height={height}
      {...shared}
    />
  );
}
