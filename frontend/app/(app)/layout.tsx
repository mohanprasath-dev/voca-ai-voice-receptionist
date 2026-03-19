'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/ui/footer';
import { Navbar } from '@/components/ui/navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const isDemo = pathname?.startsWith('/demo');

  return (
    <div className="bg-transparent text-foreground flex min-h-dvh flex-col overflow-hidden">
      <Navbar />
      <main className="flex flex-1 flex-col">{children}</main>
      {!isDemo && <Footer />}
    </div>
  );
}
