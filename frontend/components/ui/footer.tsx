'use client';

import Link from 'next/link';
import * as Icons from '@phosphor-icons/react';
import { Container } from './container';

export const Footer = () => {
  return (
    <footer className="border-t border-white/8 py-16" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }}>
      <Container>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">

          {/* Brand */}
          <div className="col-span-1 md:col-span-4">
            <Link href="/" className="inline-block">
              <span className="text-[15px] font-black tracking-[0.3em] text-white">VOCA</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/45">
              Real-time multilingual AI voice agent. Speak in any language —
              Voca understands, responds, and adapts instantly.
            </p>
          </div>

          {/* Links */}
          <div className="col-span-1 md:col-span-2 md:col-start-7">
            <h4 className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase mb-5">Product</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Home',       href: '/' },
                { label: 'Live Demo',  href: '/demo' },
                { label: 'Dashboard',  href: '/dashboard' },
                { label: 'About',      href: '/about' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/45 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer */}
          <div className="col-span-1 md:col-span-3">
            <h4 className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase mb-5">Builder</h4>
            <p className="text-sm font-semibold text-white">Mohan Prasath P</p>
            <p className="mt-1 text-xs text-white/40">AI Engineer &amp; Builder</p>
            <div className="mt-4 flex items-center gap-4">
              <a href="https://github.com/mohanprasath-dev" target="_blank" rel="noopener noreferrer"
                className="text-white/35 hover:text-white transition-colors" aria-label="GitHub">
                <Icons.GithubLogoIcon size={18} weight="fill" />
              </a>
              <a href="https://linkedin.com/in/mohanprasath21" target="_blank" rel="noopener noreferrer"
                className="text-white/35 hover:text-white transition-colors" aria-label="LinkedIn">
                <Icons.LinkedinLogoIcon size={18} weight="fill" />
              </a>
              <a href="https://www.mohanprasath.dev" target="_blank" rel="noopener noreferrer"
                className="text-white/35 hover:text-white transition-colors" aria-label="Portfolio">
                <Icons.GlobeIcon size={18} weight="fill" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/6 pt-8 md:flex-row">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Voca AI · Built with LiveKit, Murf Falcon, Deepgram &amp; Gemini
          </p>
          <p className="text-xs text-white/25">
            mohanprasath-dev · mohanprasath21 · mohanprasath.dev
          </p>
        </div>
      </Container>
    </footer>
  );
};
