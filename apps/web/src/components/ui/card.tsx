import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4 shadow-sm',
        'border-[var(--border)] bg-[var(--card)]',
        className,
      )}
    >
      {children}
    </div>
  );
}