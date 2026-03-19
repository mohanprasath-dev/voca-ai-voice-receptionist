'use client';

import { Hero } from '@/components/ui/hero';
import { Navbar } from '@/components/ui/navbar';

export default function LandingPage() {
  return (
    <div className="bg-transparent text-white selection:bg-cyan-500/30 relative min-h-screen overflow-hidden">
      <Navbar />
      <main>
        <Hero />
      </main>
    </div>
  );
}
