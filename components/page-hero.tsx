import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  imageSrc: string;
  ariaLabel: string;
  children: React.ReactNode;
  contentClassName?: string;
  imageAlt?: string;
  priority?: boolean;
  variant?: 'home' | 'brand';
}

export function PageHero({
  imageSrc,
  ariaLabel,
  children,
  contentClassName,
  imageAlt = '',
  priority = true,
  variant = 'home',
}: PageHeroProps) {
  return (
    <section
      className={cn('page-hero', variant === 'brand' && 'page-hero--brand')}
      aria-label={ariaLabel}
    >
      <div className="page-hero-media" aria-hidden>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="page-hero-overlay" />
      </div>

      <div className={cn('page-hero-content section-container', contentClassName)}>
        {children}
      </div>
    </section>
  );
}
