import Image from 'next/image';
import Link from 'next/link';
import { BRAND, BRAND_LOGOS } from '@/lib/constants/brand';
import { cn } from '@/lib/utils';

export type BrandLogoVariant = 'wordmark' | 'mark';
export type BrandLogoTheme = 'dark' | 'light';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  /** dark = black mark on transparent, light = white mark on transparent */
  theme?: BrandLogoTheme;
  className?: string;
  imageClassName?: string;
  href?: string;
  priority?: boolean;
}

const LOGO_DIMENSIONS: Record<
  BrandLogoVariant,
  { width: number; height: number }
> = {
  wordmark: { width: 352, height: 104 },
  mark: { width: 52, height: 52 },
};

export function BrandLogo({
  variant = 'wordmark',
  theme = 'dark',
  className,
  imageClassName,
  href = '/',
  priority = false,
}: BrandLogoProps) {
  const src = BRAND_LOGOS[variant][theme];
  const { width, height } = LOGO_DIMENSIONS[variant];

  const image = (
    <Image
      src={src}
      alt={BRAND.name}
      width={width}
      height={height}
      priority={priority}
      className={cn('h-auto w-auto max-w-full object-contain', imageClassName)}
    />
  );

  if (!href) {
    return <span className={cn('inline-flex shrink-0', className)}>{image}</span>;
  }

  return (
    <Link
      href={href}
      className={cn('inline-flex shrink-0 transition-opacity hover:opacity-85', className)}
      aria-label={`${BRAND.name} forsiden`}
    >
      {image}
    </Link>
  );
}
