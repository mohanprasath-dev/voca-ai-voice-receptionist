'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Container } from './container';
import { MobileNav } from './mobile-nav';

const NAV_LINKS = [
  { name: 'About', href: '/about' },
  { name: 'Dashboard', href: '/dashboard' },
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 right-0 left-0 z-[100] bg-transparent backdrop-blur-sm">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="group flex items-center">
            <span className="text-[14px] font-extrabold tracking-[0.28em] text-white">VOCA</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'text-sm font-medium tracking-wide text-white/70 transition-colors hover:text-white',
                  pathname === link.href ? 'text-white' : ''
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <MobileNav />
          </div>
        </div>
      </Container>
    </nav>
  );
};
