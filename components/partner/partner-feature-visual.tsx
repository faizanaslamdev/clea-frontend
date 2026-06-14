import Image from 'next/image';
import { cn } from '@/lib/utils';

type PartnerFeatureVisualVariant = 'chat' | 'brands' | 'search';

const PARTNER_VISUALS: Record<
  PartnerFeatureVisualVariant,
  { src: string; alt: string }
> = {
  chat: {
    src: '/partner/partner-ai-chat.png',
    alt: 'Clea AI-søk med chat og produktforslag',
  },
  brands: {
    src: '/partner/partner-brand-pages.png',
    alt: 'Clea merkesider med produktutforskning',
  },
  search: {
    src: '/partner/partner-product-search.png',
    alt: 'Clea produktsøk med forslag og resultater',
  },
};

export function PartnerFeatureVisual({
  variant,
  className,
}: {
  variant: PartnerFeatureVisualVariant;
  className?: string;
}) {
  const visual = PARTNER_VISUALS[variant];

  return (
    <div className={cn('partner-page__visual', className)}>
      <div className="partner-page__visual-frame">
        <Image
          src={visual.src}
          alt={visual.alt}
          width={1200}
          height={675}
          className="partner-page__visual-image"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
        />
      </div>
    </div>
  );
}
