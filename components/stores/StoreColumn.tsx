import type { Store } from '@/lib/types';
import { StoreCard } from "./StoreCard";

type Props = {
  items: Store[];
};

export default function StoreColumn({ items }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {items.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
}``