import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
  iconClassName?: string;
  textClassName?: string;
}

export function BrandLogo({
  className,
  showText = true,
  iconClassName,
  textClassName,
}: BrandLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm',
          iconClassName
        )}
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-primary-foreground"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 4L18 12L12 20L6 12L12 4Z" opacity="0.65" />
          <path d="M12 8.5L14.8 12L12 15.5L9.2 12L12 8.5Z" />
        </svg>
      </span>
      {showText && (
        <span
          className={cn(
            'brand-logo-text font-serif text-lg font-light tracking-tight text-foreground md:text-xl',
            textClassName,
          )}
        >
          Nordic Price
        </span>
      )}
    </span>
  );
}
