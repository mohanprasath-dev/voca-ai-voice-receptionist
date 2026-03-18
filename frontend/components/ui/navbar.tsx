'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Container } from './container';
import { GlassButton } from './glass-button';
import { MobileNav } from './mobile-nav';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Features', href: '/#features' },
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 right-0 left-0 z-[100] border-b border-white/5 bg-black/25 backdrop-blur-2xl">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="group flex items-center">
            <span className="text-gradient-ai text-[17px] font-semibold tracking-[0.12em] uppercase text-white/95">
              Voca
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'text-sm font-medium tracking-wide transition-colors hover:text-white',
                  pathname === link.href ? 'text-white' : 'text-white/60'
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/demo">
              <GlassButton variant="primary" size="sm" className="px-5">
                Try Demo
              </GlassButton>
            </Link>
            <MobileNav />
          </div>
        </div>
      </Container>
    </nav>
  );
};
