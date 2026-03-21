import { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full rounded-xl border px-4 py-3 text-sm outline-none',
        'border-[var(--border)] bg-[var(--card)] text-white',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}