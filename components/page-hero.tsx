import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  /** Only rendered for variant="brand" — the home hero has no photo. */
  imageSrc?: string;
  ariaLabel: string;
  children: React.ReactNode;
  contentClassName?: string;
  imageAlt?: string;
  imagePosition?: string;
  priority?: boolean;
  variant?: 'home' | 'brand';
}

export function PageHero({
  imageSrc,
  ariaLabel,
  children,
  contentClassName,
  imageAlt = '',
  imagePosition,
  priority = true,
  variant = 'home',
}: PageHeroProps) {
  const showMedia = variant === 'brand' && !!imageSrc;

  return (
    <section
      className={cn(
        'page-hero',
        variant === 'home' ? 'page-hero--home' : 'page-hero--brand',
      )}
      aria-label={ariaLabel}
    >
      {showMedia ? (
        <div className="page-hero-media" aria-hidden>
          <Image
            src={imageSrc as string}
            alt={imageAlt}
            fill
            priority={priority}
            sizes="100vw"
            className="page-hero-media__ken-burns object-cover object-center"
            style={imagePosition ? { objectPosition: imagePosition } : undefined}
          />
          <div className="page-hero-overlay" />
        </div>
      ) : null}

      <div className={cn('page-hero-content section-container', contentClassName)}>
        {children}
      </div>
    </section>
  );
}
