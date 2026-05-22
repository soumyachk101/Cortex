import { LandingNavbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { AIShowcase } from '@/components/landing/ai-showcase';
import { BuiltBy } from '@/components/landing/stats';
import { CTA } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-alabaster">
      <LandingNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <AIShowcase />
      <BuiltBy />
      <CTA />
      <Footer />
    </main>
  );
}
