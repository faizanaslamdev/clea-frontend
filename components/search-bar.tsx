'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
  compact?: boolean;
  className?: string;
  inputClassName?: string;
}

export function SearchBar({
  onSearch,
  placeholder = 'Search products...',
  defaultValue = '',
  compact = false,
  className,
  inputClassName,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <form onSubmit={handleSearch} className={cn('w-full min-w-0', className)}>
      <div className="flex gap-2">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn('min-w-0 flex-1', inputClassName)}
        />
        {compact ? (
          <Button type="submit" size="icon" className="shrink-0" aria-label="Search">
            <Search className="size-4" strokeWidth={1.5} />
          </Button>
        ) : (
          <Button type="submit" className="shrink-0 px-5">
            Search
          </Button>
        )}
      </div>
    </form>
  );
}
