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
    <nav className="bg-background/50 fixed top-0 right-0 left-0 z-[100] border-b border-white/5 backdrop-blur-xl">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div className="bg-foreground relative size-8 overflow-hidden rounded-lg p-[1px]">
              <div className="bg-background flex h-full w-full items-center justify-center rounded-[7px]">
                <div className="bg-foreground size-4 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Voca</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'hover:text-foreground text-sm font-medium transition-colors',
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
