import type { Store } from '@/lib/types';
import { PINNED_BRANDS } from '@/lib/constants/pinned-brands';
import { sortStoresWithPinned } from '@/lib/domain/stores/pin-sort';
import { matchesMerchantAliases } from '@/lib/domain/stores/merchant-match';
import { getBrandHref } from '@/lib/domain/stores/slug';
import { getBrandEditorialImage } from '@/lib/constants/brand-editorial-images';
import BrandColumn from './BrandColumn';

type Props = {
  brands: Store[];
};

export function prepareBrandGridBrands(brands: Store[]): Store[] {
  return sortStoresWithPinned(brands).map((brand) => {
    const pinned = PINNED_BRANDS.find((config) =>
      matchesMerchantAliases(brand, config.names),
    );

    return {
      ...brand,
      // Preserve the live merchant slug and existing editorial-image mapping
      // when a feed-specific name is replaced by a customer-facing name.
      href: brand.href ?? getBrandHref(brand),
      name: pinned?.displayName ?? brand.name,
      coverImage: getBrandEditorialImage(brand.name) ?? brand.coverImage,
      size: 'md' as const,
    };
  });
}

export default function BrandGrid({ brands }: Props) {
  const orderedBrands = prepareBrandGridBrands(brands);
  const col1: Store[] = [];
  const col2: Store[] = [];
  const col3: Store[] = [];

  // Keep the first two pinned brands in one column. The third pinned brand
  // starts the next column while retaining NLY Man → Nelly → Ralph DOM order.
  orderedBrands.forEach((brand, index) => {
    if (index < 2) {
      col1.push(brand);
      return;
    }

    // Fill the shortest column so an incomplete final row stays compact.
    // With five brands this yields 2 / 2 / 1 cards instead of 3 / 1 / 1.
    const shortestColumn = [col1, col2, col3].reduce((shortest, column) =>
      column.length < shortest.length ? column : shortest,
    );
    shortestColumn.push(brand);
  });

  return (
    <div className="brand-grid">
      <BrandColumn brands={col1} />
      <BrandColumn brands={col2} />
      <BrandColumn brands={col3} />
    </div>
  );
}
