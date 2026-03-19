'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/ui/footer';
import { Navbar } from '@/components/ui/navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDemo = pathname?.startsWith('/demo');

  return (
    <div className="flex min-h-dvh flex-col" style={{ background: 'transparent' }}>
      <Navbar />
      <main className="flex flex-1 flex-col">{children}</main>
      {!isDemo && <Footer />}
    </div>
  );
}
