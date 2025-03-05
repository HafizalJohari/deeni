'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { GlowEffect, GlowEffectProps } from './GlowEffect';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glowConfig?: Partial<GlowEffectProps>;
  children: React.ReactNode;
}

export function GlowButton({
  className,
  variant = 'primary',
  size = 'md',
  glowConfig,
  children,
  ...props
}: GlowButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#00A53D] text-white hover:bg-[#008236]';
      case 'secondary':
        return 'bg-gray-100 text-[#00A53D] hover:bg-gray-200 hover:text-[#008236]';
      case 'outline':
        return 'bg-transparent border-2 border-[#00A53D] text-[#00A53D] hover:bg-[#00A53D]/10 hover:border-[#008236] hover:text-[#008236]';
      case 'ghost':
        return 'bg-transparent text-[#00A53D] hover:bg-[#00A53D]/10 hover:text-[#008236]';
      default:
        return 'bg-[#00A53D] text-white hover:bg-[#008236]';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3 py-1 text-sm';
      case 'md':
        return 'h-9 px-4 py-2';
      case 'lg':
        return 'h-11 px-6 py-2.5 text-lg';
      default:
        return 'h-9 px-4 py-2';
    }
  };

  const defaultGlowConfig: Partial<GlowEffectProps> = {
    colors: ['#00A53D', '#008236', '#00A53D'],
    mode: 'breathe',
    blur: 'strong',
    scale: 1.2,
    duration: 3,
  };

  const mergedGlowConfig = {
    ...defaultGlowConfig,
    ...glowConfig,
  };

  return (
    <button
      className={cn(
        'group relative inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 ease-in-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#00A53D]',
        'disabled:opacity-50 disabled:pointer-events-none',
        'overflow-hidden',
        getVariantClasses(),
        getSizeClasses(),
        className
      )}
      {...props}
    >
      <GlowEffect
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        {...mergedGlowConfig}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
} 