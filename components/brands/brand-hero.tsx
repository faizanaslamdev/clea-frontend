import Image from 'next/image';
import { PageHero } from '@/components/page-hero';
import type { Store } from '@/lib/types';

interface BrandHeroProps {
  brand: Store;
}

export function BrandHero({ brand }: BrandHeroProps) {
  return (
    <PageHero
      variant="brand"
      imageSrc={brand.coverImage}
      ariaLabel={brand.name}
      contentClassName="page-hero-content--brand"
    >
      <div className="flex flex-col items-center gap-5 md:gap-6">
        {brand.logo ? (
          <div className="relative h-14 w-[min(72%,14rem)] sm:h-16 md:h-[4.5rem]">
            <Image
              src={brand.logo}
              alt={brand.name}
              fill
              className="object-contain drop-shadow-md"
              sizes="224px"
              priority
            />
          </div>
        ) : (
          <h1 className="brand-hero-title">{brand.name}</h1>
        )}
      </div>
    </PageHero>
  );
}
