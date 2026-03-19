'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface AuroraProps {
  className?: string;
  color1?: string;
  color2?: string;
  color3?: string;
}

export const Aurora = ({
  className,
  color1 = 'rgba(6, 182, 212, 0.15)', // cyan-500
  color2 = 'rgba(59, 130, 246, 0.15)', // blue-500
  color3 = 'rgba(168, 85, 247, 0.1)', // purple-500
}: AuroraProps) => {
  return (
    <div className={cn('fixed inset-0 overflow-hidden pointer-events-none bg-[#030303]', className)}>
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute -top-[20%] -left-[10%] h-[1000px] w-[1000px] rounded-full blur-[120px]"
        style={{ background: color1 }}
      />
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 120, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute -bottom-[20%] -right-[10%] h-[1000px] w-[1000px] rounded-full blur-[120px]"
        style={{ background: color2 }}
      />
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, -100, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute top-[30%] left-[20%] h-[800px] w-[800px] rounded-full blur-[150px]"
        style={{ background: color3 }}
      />
      
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};
