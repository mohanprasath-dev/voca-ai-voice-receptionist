'use client';

import Link from 'next/link';
import { GithubLogo, Globe, LinkedinLogo } from '@phosphor-icons/react';
import { Container } from './container';

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-white/5 py-20">
      <Container>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="col-span-1 md:col-span-4">
            <Link href="/" className="group flex items-center gap-2">
              <div className="bg-foreground relative size-8 overflow-hidden rounded-lg p-[1px]">
                <div className="bg-background flex h-full w-full items-center justify-center rounded-[7px]">
                  <div className="bg-foreground size-4 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight">Voca</span>
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
                Senior Frontend Engineer & Product Designer
              </p>
              <div className="mt-4 flex gap-4">
                <a
                  href="https://github.com/mohanprasath-dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <GithubLogo size={20} weight="fill" />
                </a>
                <a
                  href="https://linkedin.com/in/mohanprasath21"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="LinkedIn"
                >
                  <LinkedinLogo size={20} weight="fill" />
                </a>
                <a
                  href="https://www.mohanprasath.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Portfolio"
                >
                  <Globe size={20} weight="fill" />
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
