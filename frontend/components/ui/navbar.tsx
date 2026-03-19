'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Container } from './container';
import { MobileNav } from './mobile-nav';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Demo', href: '/demo' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'About', href: '/about' },
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 right-0 left-0 z-[100] border-b border-white/5 bg-[#030303]/60 backdrop-blur-xl">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 font-black text-white shadow-[0_0_15px_rgba(34,211,238,0.3)] group-hover:scale-105 transition-transform">
              V
            </div>
            <span className="text-[14px] font-black tracking-[0.2em] text-white">VOCA</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:bg-white/5',
                  pathname === link.href ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/70'
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <MobileNav />
          </div>
        </div>
      </Container>
    </nav>
  );
};
