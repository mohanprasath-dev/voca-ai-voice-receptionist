'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { cn } from '@/lib/utils';
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
    <nav className="fixed top-5 left-1/2 z-100 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 shadow-[0_0_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
      <div className="flex items-center gap-1 px-2 py-2">
        <Link href="/">
          <span className="px-3 text-[13px] font-black tracking-[0.25em] text-white">VOCA</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                'rounded-full px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase transition-all duration-300',
                pathname === link.href
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <ThemeToggle className="hidden md:inline-flex" />

        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </nav>
  );
};
