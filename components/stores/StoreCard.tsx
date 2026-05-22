import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Store } from '@/lib/types';

const heightMap = {
  sm: 'h-[260px] md:h-[230px]',
  md: 'h-[260px] md:h-[330px]',
  lg: 'h-[260px] md:h-[396px]',
} as const;

export function StoreCard({ store }: { store: Store }) {
  const href = store.href ?? `/search?store=${store.id}`;
  const size = store.size ?? 'md';

  return (
    <Link
      href={href}
      className={cn('group relative block w-full', heightMap[size])}
    >
      <div className="relative h-full w-full overflow-hidden rounded-lg">
        <Image
          src={store.coverImage}
          alt={`${store.name} cover`}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-foreground/15" aria-hidden />
        <div className="relative flex h-full items-center justify-center p-4">
          {store.logo ? (
            <div className="relative h-[69px] w-[184px]">
              <Image src={store.logo} alt={`${store.name} logo`} fill className="object-contain" />
            </div>
          ) : (
            <span className="font-semibold tracking-wide text-card drop-shadow-sm">
              {store.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}