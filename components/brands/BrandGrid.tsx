import type { Store } from '@/lib/types';
import { sortStoresWithPinned } from '@/lib/domain/stores/pin-sort';
import { getBrandEditorialImage } from '@/lib/constants/brand-editorial-images';
import BrandColumn from './BrandColumn';

type Props = {
  brands: Store[];
};

export default function BrandGrid({ brands }: Props) {
  const orderedBrands = sortStoresWithPinned(brands).map((brand, index) => ({
    ...brand,
    coverImage: getBrandEditorialImage(brand.name, index),
    size: 'md' as const,
  }));
  const col1: Store[] = [];
  const col2: Store[] = [];
  const col3: Store[] = [];

  // Pinned order starts with NLY Man and Nelly. Keep both in the first
  // column so Nelly appears directly beneath NLY Man on desktop.
  orderedBrands.forEach((brand, index) => {
    if (index < 2) {
      col1.push(brand);
      return;
    }

    const remainingIndex = index - 2;
    if (remainingIndex % 3 === 0) col2.push(brand);
    else if (remainingIndex % 3 === 1) col3.push(brand);
    else col1.push(brand);
  });

  return (
    <div className="brand-grid">
      <BrandColumn brands={col1} />
      <BrandColumn brands={col2} />
      <BrandColumn brands={col3} />
    </div>
  );
}
