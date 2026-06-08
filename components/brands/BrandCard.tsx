'use client';

import { useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getBrandHref } from '@/lib/services';
import type { Store } from '@/lib/types';
import { Card } from '@/components/ui/card';

const heightMap = {
  sm: 'h-[260px] md:h-[228px]',
  md: 'h-[260px] md:h-[322px]',
  lg: 'h-[260px] md:h-[388px]',
} as const;

const MAX_TILT = 12;
const HOVER_SCALE = 1.03;

export function BrandCard({ brand }: { brand: Store }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const href = brand.href ?? getBrandHref(brand);
  const size = brand.size ?? 'md';

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    const card = cardRef.current;
    if (!card) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * MAX_TILT;
    const rotateY = ((x - centerX) / centerX) * MAX_TILT;

    card.style.transition = 'transform:none';
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${HOVER_SCALE}, ${HOVER_SCALE}, ${HOVER_SCALE})`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;

    card.style.transition = '';
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }, []);

  return (
    <Link
      href={href}
      className={cn('brand-card-tilt-wrapper relative block w-full', heightMap[size])}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Card
        ref={cardRef}
        className="brand-card-tilt relative h-full w-full overflow-hidden p-0"
      >
        {brand.coverImage ? (
          <Image
            src={brand.coverImage}
            alt={`${brand.name} cover`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        ) : null}
        <div className="absolute inset-0 bg-foreground/20" aria-hidden />
        <div className="relative flex h-full items-center justify-center p-6">
          {brand.logo ? (
            <div className="relative h-[52px] w-[min(78%,11rem)] md:h-[60px]">
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-contain drop-shadow-sm"
                sizes="184px"
                unoptimized
              />
            </div>
          ) : (
            <p className="max-w-[90%] text-center font-serif text-2xl font-light tracking-tight text-background drop-shadow-md md:text-3xl">
              {brand.name}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
