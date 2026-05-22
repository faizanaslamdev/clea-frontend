import type { Store } from '@/lib/types';
import StoreColumn from "./StoreColumn";

type Props = {
  stores: Store[];
};

export default function StoreGrid({ stores }: Props) {
  // split into 3 columns
  const col1: Store[] = [];
  const col2: Store[] = [];
  const col3: Store[] = [];

  stores.forEach((store, index) => {
    if (index % 3 === 0) col1.push(store);
    else if (index % 3 === 1) col2.push(store);
    else col3.push(store);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StoreColumn items={col1} />
      <StoreColumn items={col2} />
      <StoreColumn items={col3} />
    </div>
  );
}