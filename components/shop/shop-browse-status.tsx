'use client';

import { AiSparkIcon } from '@/components/icons/ai-spark-icon';

interface ShopBrowseStatusProps {
  /** Shown while results are being fetched or swapped. */
  visible: boolean;
  label: string;
}

/**
 * Floating status pill shown over the (blurred) product grid while results
 * resolve, so a filter change reads as CLEA working rather than the page
 * stalling.
 *
 * Rendered as a sibling of the grid, never a child: the grid carries a CSS
 * `filter` while swapping, and a filtered element becomes the containing block
 * for fixed-position descendants — nested here, the pill would be positioned
 * against the grid and blurred along with it.
 */
export function ShopBrowseStatus({ visible, label }: ShopBrowseStatusProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="browse-status" role="status" aria-live="polite">
      <span className="browse-status__pill">
        <AiSparkIcon className="browse-status__spark" />
        <span className="browse-status__label">{label}</span>
        <span className="browse-status__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </span>
    </div>
  );
}
