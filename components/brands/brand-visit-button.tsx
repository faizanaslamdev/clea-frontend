'use client';

import { ArrowUpRight } from 'lucide-react';
import { useBrandVisitLink } from '@/lib/hooks/useBrandVisitLink';
import type { Store } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BrandVisitButtonProps {
  brand: Store;
  className?: string;
}

export function BrandVisitButton({ brand, className }: BrandVisitButtonProps) {
  const { href, isExternal } = useBrandVisitLink(brand);
  const label = `Visit ${brand.name}`;

  const classNames = cn('brand-visit-btn', className);

  if (!href) {
    return (
      <button
        type="button"
        className={classNames}
        disabled
        aria-disabled="true"
        title="Store link coming soon"
      >
        <span>{label}</span>
        <ArrowUpRight className="size-4 shrink-0" aria-hidden />
      </button>
    );
  }

  return (
    <a
      href={href}
      className={classNames}
      {...(isExternal
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
    >
      <span>{label}</span>
      <ArrowUpRight className="size-4 shrink-0" aria-hidden />
    </a>
  );
}
