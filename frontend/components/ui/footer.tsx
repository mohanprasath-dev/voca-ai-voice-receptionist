'use client';

import Link from 'next/link';
import * as Icons from '@phosphor-icons/react';
import { Container } from './container';

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-white/5 py-20">
      <Container>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="col-span-1 md:col-span-4">
            <Link href="/" className="group flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                <span className="text-[12px] font-black text-white">V</span>
              </div>
              <span className="text-[14px] font-black tracking-[0.2em] text-white">VOCA</span>
            </Link>
            <p className="text-muted-foreground mt-6 max-w-sm leading-relaxed">
              Voca is a next-generation voice AI platform designed for real-time human-AI
              interaction. Built with cutting-edge technology to deliver the most natural
              conversational experience.
            </p>
          </div>

          <div className="col-span-1 md:col-span-2 md:col-start-7">
            <h4 className="text-sm font-bold tracking-wider uppercase">Product</h4>
            <ul className="text-muted-foreground mt-6 space-y-4 text-sm">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-foreground transition-colors">
                  Demo
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-3">
            <h4 className="text-sm font-bold tracking-wider uppercase">Developer</h4>
            <div className="mt-6">
              <p className="text-foreground text-sm font-medium">Mohan Prasath P</p>
              <p className="text-muted-foreground mt-1 text-xs">
                AI Engineer & Builder
              </p>
              <div className="mt-4 flex gap-4">
                <a
                  href="https://github.com/mohanprasath-dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <Icons.GithubLogoIcon size={20} weight="fill" />
                </a>
                <a
                  href="https://linkedin.com/in/mohanprasath21"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="LinkedIn"
                >
                  <Icons.LinkedinLogoIcon size={20} weight="fill" />
                </a>
                <a
                  href="https://www.mohanprasath.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Portfolio"
                >
                  <Icons.GlobeIcon size={20} weight="fill" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-center md:flex-row md:text-left">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Voca AI. All rights reserved.
          </p>
          <div className="text-muted-foreground flex gap-8 text-xs">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};
