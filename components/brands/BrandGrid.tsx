import type { Store } from '@/lib/types';
import BrandColumn from './BrandColumn';

type Props = {
  brands: Store[];
};

/** Masonry gallery heights — keeps the landing brand grid visually varied. */
const GALLERY_SIZE_PATTERN = [
  'md',
  'lg',
  'sm',
  'sm',
  'md',
  'lg',
  'lg',
  'sm',
  'md',
] as const;

export default function BrandGrid({ brands }: Props) {
  const col1: Store[] = [];
  const col2: Store[] = [];
  const col3: Store[] = [];

  brands.forEach((brand, index) => {
    const sizedBrand: Store = {
      ...brand,
      size: GALLERY_SIZE_PATTERN[index % GALLERY_SIZE_PATTERN.length],
    };

    if (index % 3 === 0) col1.push(sizedBrand);
    else if (index % 3 === 1) col2.push(sizedBrand);
    else col3.push(sizedBrand);
  });

  return (
    <div className="brand-grid">
      <BrandColumn brands={col1} />
      <BrandColumn brands={col2} />
      <BrandColumn brands={col3} />
    </div>
  );
}
