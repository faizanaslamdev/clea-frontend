import type { Store } from '@/lib/types';
import { BrandCard } from './BrandCard';

type Props = {
  brands: Store[];
};

export default function BrandColumn({ brands }: Props) {
  return (
    <div className="brand-column">
      {brands.map((brand) => (
        <BrandCard key={brand.id} brand={brand} />
      ))}
    </div>
  );
}
