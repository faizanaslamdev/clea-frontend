import { BRAND } from '@/lib/constants/brand';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export function BrandLogo({
  className,
  showText = true,
  textClassName,
}: BrandLogoProps) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      {showText ? (
        <span
          className={cn(
            'brand-logo-text font-serif text-lg font-light tracking-tight text-foreground md:text-xl',
            textClassName,
          )}
        >
          {BRAND.wordmark}
        </span>
      ) : null}
    </span>
  );
}
