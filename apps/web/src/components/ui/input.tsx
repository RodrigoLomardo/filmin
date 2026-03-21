import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border px-4 py-3 text-sm outline-none',
        'border-[var(--border)] bg-[var(--card)] text-white',
        className,
      )}
      {...props}
    />
  );
}