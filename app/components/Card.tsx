import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false }) => {
  const baseStyles = 'bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-lg';
  const hoverStyles = hover ? 'hover:shadow-2xl hover:border-neutral-700' : '';

  return (
    <div className={cn(baseStyles, hoverStyles, className)}>
      {children}
    </div>
  );
};
