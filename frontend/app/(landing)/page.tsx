'use client';

import { Hero } from '@/components/ui/hero';
import { Navbar } from '@/components/ui/navbar';

export default function LandingPage() {
  return (
    <div className="voca-navy-bg text-foreground selection:bg-foreground selection:text-background relative min-h-screen overflow-hidden">
      <Navbar />
      <main>
        <Hero />
      </main>
    </div>
  );
}
