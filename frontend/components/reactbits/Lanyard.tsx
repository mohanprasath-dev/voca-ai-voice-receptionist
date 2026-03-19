'use client';

import React from 'react';
import { motion } from 'motion/react';
import * as Icons from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface LanyardProps {
  name: string;
  role: string;
  socials: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
  className?: string;
}

export const Lanyard = ({ name, role, socials, className }: LanyardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        'relative flex flex-col items-center justify-center p-12 transition-all duration-500',
        'backdrop-blur-lg bg-white/5 border border-white/10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
        'max-w-md mx-auto group',
        className
      )}
    >
      {/* Decorative Lanyard String */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-1.5 h-12 bg-gradient-to-b from-transparent to-white/20" />
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border border-white/20" />

      {/* Profile Image / Placeholder */}
      <div className="relative size-32 rounded-full overflow-hidden mb-8 border-2 border-cyan-500/50 p-1 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
        <div className="h-full w-full rounded-full bg-white/5 flex items-center justify-center">
           <Icons.UserIcon size={48} weight="duotone" className="text-cyan-400" />
        </div>
      </div>

      <div className="text-center space-y-3">
        <h3 className="text-3xl font-black tracking-tight text-white">{name}</h3>
        <div className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <span className="text-xs font-black tracking-widest uppercase text-cyan-400">
            {role}
          </span>
        </div>
      </div>

      <div className="mt-12 flex items-center justify-center gap-6">
        {socials.linkedin && (
          <a
            href={`https://linkedin.com/in/${socials.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white transition-colors p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5"
            aria-label="LinkedIn"
          >
            <Icons.LinkedinLogoIcon size={24} weight="duotone" />
          </a>
        )}
        {socials.github && (
          <a
            href={`https://github.com/${socials.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white transition-colors p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5"
            aria-label="GitHub"
          >
            <Icons.GithubLogoIcon size={24} weight="duotone" />
          </a>
        )}
        {socials.website && (
          <a
            href={`https://${socials.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white transition-colors p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5"
            aria-label="Website"
          >
            <Icons.GlobeIcon size={24} weight="duotone" />
          </a>
        )}
      </div>

      {/* Bottom ID Strip */}
      <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-b-[3rem] opacity-50" />
    </motion.div>
  );
};
