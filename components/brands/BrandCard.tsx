import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getBrandEditorialPosition } from '@/lib/constants/brand-editorial-images';
import { getBrandHref } from '@/lib/services';
import type { Store } from '@/lib/types';

export function BrandCard({ brand }: { brand: Store }) {
  const href = brand.href ?? getBrandHref(brand);

  return (
    <Link
      href={href}
      className="brand-card group relative block aspect-4/3 w-full overflow-hidden rounded-[1.25rem]"
    >
      {brand.coverImage ? (
        <Image
          src={brand.coverImage}
          alt=""
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          style={{ objectPosition: getBrandEditorialPosition(brand.name) }}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 bg-muted" aria-hidden />
      )}

      <div
        className="absolute inset-0 bg-linear-to-t from-black/70 via-black/5 to-transparent"
        aria-hidden
      />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white md:p-6">
        <div className="min-w-0">
          <p className="mb-1 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/70">
            Utforsk merket
          </p>
          <h2 className="truncate font-serif text-2xl font-light tracking-tight md:text-[1.75rem]">
            {brand.name}
          </h2>
        </div>

        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 backdrop-blur-sm transition-colors group-hover:bg-white group-hover:text-black">
          <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
