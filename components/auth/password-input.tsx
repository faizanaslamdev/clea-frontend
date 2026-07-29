'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type PasswordInputProps = Omit<
  React.ComponentProps<typeof Input>,
  'type'
>;

export function PasswordInput({
  className,
  disabled,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="auth-password">
      <Input
        {...props}
        type={isVisible ? 'text' : 'password'}
        disabled={disabled}
        className={cn('auth-password__input', className)}
      />
      <button
        type="button"
        className="auth-password__toggle"
        aria-label={isVisible ? 'Skjul passord' : 'Vis passord'}
        aria-pressed={isVisible}
        disabled={disabled}
        onClick={() => setIsVisible((visible) => !visible)}
      >
        {isVisible ? (
          <EyeOff className="size-4.5" aria-hidden />
        ) : (
          <Eye className="size-4.5" aria-hidden />
        )}
      </button>
    </div>
  );
}
