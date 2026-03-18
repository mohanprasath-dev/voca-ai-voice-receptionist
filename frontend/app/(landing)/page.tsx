'use client';

import { Footer } from '@/components/ui/footer';
import { Hero } from '@/components/ui/hero';
import { Navbar } from '@/components/ui/navbar';
import { CTASection, Features } from '@/components/ui/sections';
import { Stats } from '@/components/ui/stats';

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground selection:bg-foreground selection:text-background relative min-h-screen">
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
