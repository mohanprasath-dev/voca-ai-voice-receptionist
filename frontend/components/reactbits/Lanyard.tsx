'use client';

import React, { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import * as Icons from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface LanyardProps {
  name?: string;
  role?: string;
  socials?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
  avatarUrl?: string;
  className?: string;
  // Legacy props from old 3D version — ignored but accepted to avoid type errors
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
}

export function Lanyard({
  name = 'Mohan Prasath P',
  role = 'AI Engineer / Builder',
  socials = {
    github: 'mohanprasath-dev',
    linkedin: 'mohanprasath21',
    website: 'www.mohanprasath.dev',
  },
  avatarUrl,
  className,
}: LanyardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stringSwing, setStringSwing] = useState(0);

  // Mouse position relative to card center (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring-based 3D rotation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [18, -18]), {
    stiffness: 200,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-18, 18]), {
    stiffness: 200,
    damping: 25,
  });

  // Holographic shine position
  const shineX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), {
    stiffness: 200,
    damping: 25,
  });
  const shineY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), {
    stiffness: 200,
    damping: 25,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || isDragging) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
      setStringSwing(x * 12);
    },
    [mouseX, mouseY, isDragging]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setStringSwing(0);
  }, [mouseX, mouseY]);

  // SVG lanyard string path
  const stringPath = `M 170 0 C 170 40, ${170 + stringSwing} 80, ${170 + stringSwing * 0.5} 95`;

  return (
    <div className={cn('flex flex-col items-center select-none', className)}>
      <div
        className="relative"
        style={{ width: '100%', maxWidth: 340, height: 100, marginBottom: -8 }}
      >
        <svg
          width="100%"
          height="100"
          viewBox="0 0 340 100"
          fill="none"
          style={{ overflow: 'visible' }}
        >
          <path
            d={stringPath}
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            transform="translate(1, 2)"
          />
          <defs>
            <linearGradient id="lanyardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(6,182,212,0)" />
              <stop offset="30%" stopColor="rgba(6,182,212,0.6)" />
              <stop offset="70%" stopColor="rgba(99,102,241,0.6)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0.4)" />
            </linearGradient>
          </defs>
          <path
            d={stringPath}
            stroke="url(#lanyardGrad)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <circle
            cx="170"
            cy="6"
            r="5"
            fill="rgba(255,255,255,0.15)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />
          <rect
            x="167"
            y="0"
            width="6"
            height="7"
            rx="1"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.5"
          />
          <circle
            cx={170 + stringSwing * 0.5}
            cy="95"
            r="4"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
        </svg>
      </div>

      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        drag
        dragConstraints={{ top: -60, bottom: 60, left: -80, right: 80 }}
        dragElastic={0.15}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setIsDragging(false);
          setStringSwing(0);
        }}
        onDrag={(_, info) => {
          setStringSwing(info.offset.x * 0.08);
        }}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        whileHover={{ scale: 1.02 }}
        className="relative w-full max-w-85"
      >
        <div
          className="absolute inset-0 rounded-4xl"
          style={{
            boxShadow: '0 50px 100px rgba(0,0,0,0.7), 0 20px 40px rgba(0,0,0,0.5)',
            transform: 'translateZ(-20px) scale(0.95)',
            borderRadius: '2rem',
            background: 'rgba(0,0,0,0.4)',
          }}
        />

        <div className="relative overflow-hidden rounded-4xl border border-white/8 bg-linear-to-br from-[#0f1117] via-[#0d1020] to-[#080b14]">
          <div className="h-1.5 w-full bg-linear-to-r from-cyan-500 via-blue-500 to-purple-600" />

          <motion.div
            className="pointer-events-none absolute inset-0 rounded-4xl opacity-0 transition-opacity duration-300 hover:opacity-100"
            style={{
              background: useTransform(
                [shineX, shineY],
                ([x, y]) =>
                  `radial-gradient(ellipse at ${x}% ${y}%, rgba(6,182,212,0.12) 0%, rgba(99,102,241,0.08) 40%, transparent 70%)`
              ),
            }}
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />

          <div className="p-7">
            <div className="mb-7 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 shadow-[0_0_16px_rgba(34,211,238,0.4)]">
                  <span className="text-[12px] font-black text-white">V</span>
                </div>
                <span className="text-[11px] font-black tracking-[0.3em] text-white/60 uppercase">
                  VOCA AI
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                <span className="text-[9px] font-black tracking-widest text-cyan-400 uppercase">
                  Active
                </span>
              </div>
            </div>

            <div className="mb-7 flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="flex size-15 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-cyan-500/20 to-blue-600/20">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={name}
                      width={60}
                      height={60}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icons.UserIcon size={26} weight="duotone" className="text-cyan-400" />
                  )}
                </div>
                <div className="absolute -right-1 -bottom-1 size-3.5 rounded-full border-2 border-[#0d1020] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-[18px] leading-tight font-black tracking-tight text-white">
                  {name}
                </h3>
                <p className="mt-0.5 text-[10px] font-bold tracking-widest text-white/40 uppercase">
                  {role}
                </p>
              </div>
            </div>

            <div className="mb-6 h-px w-full bg-linear-to-r from-transparent via-white/8 to-transparent" />

            <div className="flex items-center gap-2">
              {socials?.github && (
                <a
                  href={`https://github.com/${socials.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="group flex items-center gap-1.5 rounded-xl border border-white/6 bg-white/4 px-3 py-2 transition-all duration-200 hover:border-white/10 hover:bg-white/8"
                >
                  <Icons.GithubLogoIcon
                    size={13}
                    weight="fill"
                    className="text-white/40 transition-colors group-hover:text-white"
                  />
                  <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase transition-colors group-hover:text-white">
                    GitHub
                  </span>
                </a>
              )}
              {socials?.linkedin && (
                <a
                  href={`https://linkedin.com/in/${socials.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="group flex items-center gap-1.5 rounded-xl border border-white/6 bg-white/4 px-3 py-2 transition-all duration-200 hover:border-white/10 hover:bg-white/8"
                >
                  <Icons.LinkedinLogoIcon
                    size={13}
                    weight="fill"
                    className="text-white/40 transition-colors group-hover:text-white"
                  />
                  <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase transition-colors group-hover:text-white">
                    LinkedIn
                  </span>
                </a>
              )}
              {socials?.website && (
                <a
                  href={`https://${socials.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="group flex items-center gap-1.5 rounded-xl border border-white/6 bg-white/4 px-3 py-2 transition-all duration-200 hover:border-white/10 hover:bg-white/8"
                >
                  <Icons.GlobeIcon
                    size={13}
                    weight="fill"
                    className="text-white/40 transition-colors group-hover:text-white"
                  />
                  <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase transition-colors group-hover:text-white">
                    Web
                  </span>
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/4 bg-white/2 px-7 py-3">
            <span className="text-[8px] font-bold tracking-[0.4em] text-white/15 uppercase">
              ID · VOCA · 2026
            </span>
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full bg-white/10"
                  style={{ width: i % 2 === 0 ? 12 : 18 }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Lanyard;
