'use client';

import { cn } from '@/lib/utils';

const variants = {
  default: 'badge badge-default',
  primary: 'badge badge-primary',
  success: 'badge badge-success',
  warning: 'badge badge-warning',
  danger: 'badge badge-danger',
};

export function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <span
      className={cn(variants[variant] || variants.default, className)}
      {...props}
    >
      {children}
    </span>
  );
}
