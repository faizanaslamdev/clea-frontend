import type { Store } from '@/lib/types';
import BrandColumn from './BrandColumn';

type Props = {
  brands: Store[];
};

export default function BrandGrid({ brands }: Props) {
  const col1: Store[] = [];
  const col2: Store[] = [];
  const col3: Store[] = [];

  brands.forEach((brand, index) => {
    if (index % 3 === 0) col1.push(brand);
    else if (index % 3 === 1) col2.push(brand);
    else col3.push(brand);
  });

  return (
    <div className="brand-grid">
      <BrandColumn brands={col1} />
      <BrandColumn brands={col2} />
      <BrandColumn brands={col3} />
    </div>
  );
}
