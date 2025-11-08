"use client";
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'none';
  delay?: number;
  className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fade',
  delay = 0,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay]);

  const animationClasses = {
    fade: 'opacity-0 animate-fade-in',
    'slide-up': 'opacity-0 translate-y-10 animate-slide-in-up',
    'slide-down': 'opacity-0 -translate-y-10 animate-slide-in-down',
    'slide-left': 'opacity-0 translate-x-10 animate-slide-in-left',
    'slide-right': 'opacity-0 -translate-x-10 animate-slide-in-right',
    scale: 'opacity-0 scale-95 animate-scale-in',
    none: '',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        !isVisible && animation !== 'none' && animationClasses[animation],
        isVisible && 'opacity-100 translate-x-0 translate-y-0 scale-100',
        className
      )}
    >
      {children}
    </div>
  );
};
