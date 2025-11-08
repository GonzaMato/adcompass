import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  children,
  className,
}) => {
  const baseStyles = 'inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold';
  
  const variantStyles = {
    primary: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    secondary: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    success: 'bg-green-500/10 text-green-400 border border-green-500/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], className)}>
      {children}
    </span>
  );
};
