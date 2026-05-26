'use client';

import { useEffect, useId, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PillSearchBarProps {
  placeholder?: string;
  /** Controlled value */
  value?: string;
  /** Uncontrolled initial value */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called on submit; when omitted, updates `paramKey` in the current URL */
  onSubmit?: (query: string) => void;
  /** URL query param to read/write when using default routing (default: `q`) */
  paramKey?: string;
  /** Clear other params on submit (e.g. drop `category` when searching brands) */
  preserveParams?: string[];
  className?: string;
  inputClassName?: string;
  id?: string;
  'aria-label'?: string;
}

export function PillSearchBar({
  placeholder = 'Search…',
  value,
  defaultValue = '',
  onValueChange,
  onSubmit,
  paramKey = 'q',
  preserveParams,
  className,
  inputClassName,
  id: idProp,
  'aria-label': ariaLabel,
}: PillSearchBarProps) {
  const generatedId = useId();
  const inputId = idProp ?? generatedId;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const query = isControlled ? value : internalValue;

  const setQuery = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  useEffect(() => {
    if (!isControlled) setInternalValue(defaultValue);
  }, [defaultValue, isControlled]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlValue = searchParams.get(paramKey) ?? '';

  useEffect(() => {
    if (!isControlled && onSubmit === undefined) {
      setInternalValue(urlValue);
    }
  }, [urlValue, isControlled, onSubmit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();

    if (onSubmit) {
      onSubmit(trimmed);
      return;
    }

    const params = new URLSearchParams();
    const keep = new Set(preserveParams ?? []);

    for (const [key, val] of searchParams.entries()) {
      if (keep.has(key) && key !== paramKey) {
        params.set(key, val);
      }
    }

    if (trimmed) {
      params.set(paramKey, trimmed);
    }

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('pill-search-bar', className)}
      role="search"
    >
      <Search
        className="pill-search-bar__icon"
        strokeWidth={1.5}
        aria-hidden
      />
      <label htmlFor={inputId} className="sr-only">
        {ariaLabel ?? placeholder}
      </label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={cn('pill-search-bar__input', inputClassName)}
        enterKeyHint="search"
        autoComplete="off"
      />
    </form>
  );
}
