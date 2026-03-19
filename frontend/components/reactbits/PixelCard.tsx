'use client';

import React from 'react';

interface PixelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'blue' | 'purple' | 'cyan';
}

export const PixelCard = ({ variant = 'default', children, className = '', ...props }: PixelCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'blue': return 'shadow-[0_0_20px_rgba(59,130,246,0.1)] border-blue-500/20';
      case 'purple': return 'shadow-[0_0_20px_rgba(168,85,247,0.1)] border-purple-500/20';
      case 'cyan': return 'shadow-[0_0_20px_rgba(6,182,212,0.1)] border-cyan-500/20';
      default: return 'shadow-[0_0_20px_rgba(255,255,255,0.05)] border-white/10';
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border bg-[#080808] p-8 transition-all duration-300 hover:scale-[1.01] ${getVariantStyles()} ${className}`}
      {...props}
    >
      {/* Pixel Grid Background */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.07]">
        <div className="h-full w-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* Hover Glow */}
      <div className="pointer-events-none absolute -inset-px z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-current opacity-10 ${variant === 'cyan' ? 'text-cyan-500' : variant === 'blue' ? 'text-blue-500' : 'text-white'}`} />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
