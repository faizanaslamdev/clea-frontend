import { cn } from '@/lib/utils';

interface AiSparkIconProps {
  className?: string;
}

/** Single four-point AI spark — theme via `currentColor`. */
export function AiSparkIcon({ className }: AiSparkIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={cn('size-[1.125rem] shrink-0', className)}
      aria-hidden
    >
      <path d="M8 1.25L9.35 6.15L14.25 7.5L9.35 8.85L8 13.75L6.65 8.85L1.75 7.5L6.65 6.15L8 1.25Z" />
    </svg>
  );
}
