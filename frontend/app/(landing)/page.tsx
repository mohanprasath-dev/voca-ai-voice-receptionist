'use client';

import { Hero } from '@/components/ui/hero';
import { Navbar } from '@/components/ui/navbar';
import { Stats } from '@/components/ui/stats';
import { Features, CTASection } from '@/components/ui/sections';
import { Footer } from '@/components/ui/footer';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen text-white selection:bg-cyan-500/30">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
