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
  /**
   * When true, layout width/height match the header wordmark (not the raw
   * asset 352×104). Stops the logo from painting huge and covering the hero
   * before utility CSS arrives on reload.
   */
  headerSized?: boolean;
}

/** Intrinsic asset pixel size — used for quality, not on-screen layout. */
const ASSET_DIMENSIONS: Record<
  BrandLogoVariant,
  { width: number; height: number }
> = {
  wordmark: { width: 352, height: 104 },
  mark: { width: 52, height: 52 },
};

/** On-screen layout box for the header wordmark (~4.5rem tall). */
const HEADER_WORDMARK_LAYOUT = { width: 152, height: 72 } as const;

export function BrandLogo({
  variant = 'wordmark',
  theme = 'dark',
  className,
  imageClassName,
  href = '/',
  priority = false,
  headerSized = false,
}: BrandLogoProps) {
  const src = BRAND_LOGOS[variant][theme];
  const asset = ASSET_DIMENSIONS[variant];
  const layout =
    headerSized && variant === 'wordmark' ? HEADER_WORDMARK_LAYOUT : asset;

  const image = (
    <Image
      src={src}
      alt={BRAND.name}
      width={layout.width}
      height={layout.height}
      priority={priority}
      className={cn(
        'object-contain',
        headerSized ? 'site-header-logo__image' : 'h-auto w-auto max-w-full',
        imageClassName,
      )}
      style={
        headerSized
          ? {
              height: 'var(--site-header-logo-height, 4.5rem)',
              width: 'auto',
              maxWidth: '100%',
            }
          : undefined
      }
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
