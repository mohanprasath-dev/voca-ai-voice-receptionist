'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Sheet, SheetContent, SheetTrigger } from './sheet';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Demo', href: '/demo' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'About', href: '/about' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/5">
          <Menu className="size-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent position="left" className="w-[300px] border-r border-white/5 bg-[#030303]/90 backdrop-blur-2xl p-8">
        <Link href="/" className="flex items-center gap-2 mb-12" onClick={() => setOpen(false)}>
          <span className="text-[14px] font-black tracking-[0.2em] text-white uppercase">
            Voca
          </span>
        </Link>
        <div className="flex flex-col space-y-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                'text-lg font-bold tracking-[0.1em] uppercase transition-colors',
                pathname === link.href ? 'text-cyan-400' : 'text-white/40 hover:text-white'
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
