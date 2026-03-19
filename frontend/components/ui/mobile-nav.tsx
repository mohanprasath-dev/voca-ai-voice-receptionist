'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Sheet, SheetContent, SheetTrigger } from './sheet';

const NAV_LINKS = [
  { name: 'About', href: '/about' },
  { name: 'Dashboard', href: '/dashboard' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent position="left" className="pr-0">
        <Link href="/" className="group flex items-center" onClick={() => setOpen(false)}>
          <span className="text-gradient-ai text-[15px] font-semibold tracking-[0.12em] uppercase">
            Voca
          </span>
        </Link>
        <div className="bg-border my-4 h-[1px] w-full" />
        <div className="flex flex-col space-y-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                'text-muted-foreground hover:text-foreground transition-colors',
                pathname === link.href && 'text-foreground'
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
