import Link from 'next/link';
import { getListings, getAgents } from '@/lib/data-service';
import AgentCard from '@/components/AgentCard';
import HeroSection from '@/components/HeroSection';
import PropertyCarousel from '@/components/PropertyCarousel';
import { ArrowRight } from 'lucide-react';

export const revalidate = 0;

export default async function HomePage() {
  const [listings, agents] = await Promise.all([
    getListings({ status: 'active' }),
    getAgents(),
  ]);

  const featuredListings = listings.filter((l) => l.featured);
  const displayListings = featuredListings.length > 0 ? featuredListings : listings.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      {/* 3D Animated Hero */}
      <HeroSection />

      {/* Featured Properties Section */}
      <section className="py-12 sm:py-16 md:py-20 border-b border-border bg-background relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-foreground tracking-tight">
                Featured Residences
              </h2>
            </div>
            <Link
              href="/listings"
              className="group inline-flex items-center gap-2 text-xs tracking-widest uppercase font-bold text-foreground hover:text-accent transition-colors"
            >
              <span>Explore Entire Collection</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Interactive Property Carousel & Grid Switcher */}
          <PropertyCarousel listings={displayListings} />
        </div>
      </section>

      {/* Advisors Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-foreground tracking-tight">
                Private Advisory Team
              </h2>
              <p className="mt-2 text-xs text-muted leading-relaxed max-w-lg">
                Direct access to top-tier partners across primary global luxury markets. Dedicated advisors with complete discretion and localized knowledge.
              </p>
            </div>

            <Link
              href="/agents"
              className="group inline-flex items-center gap-2 text-xs tracking-widest uppercase font-bold text-foreground hover:text-accent transition-colors shrink-0"
            >
              <span>Meet All Advisors</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border shadow-md">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-background">
                <AgentCard agent={agent} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Symmetrical VIP Editorial Banner */}
      <section className="border-t border-border bg-foreground text-background py-12 sm:py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="text-[10px] uppercase tracking-widest text-accent-pale font-bold block mb-2">
                Discreet Global Representation
              </span>
              <h3 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-4">
                Seeking An Unlisted Trophy Property?
              </h3>
              <p className="text-xs sm:text-sm text-background/70 max-w-xl leading-relaxed">
                Over 40% of prime luxury transactions occur off-market. Connect with a Cognivelle principal advisor for tailored acquisition representation.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                href="/agents"
                className="group relative px-6 py-3.5 bg-accent text-background text-xs font-bold tracking-widest uppercase text-center overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Request Private Briefing
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/listings"
                className="px-6 py-3.5 border border-background/30 text-background text-xs font-bold tracking-widest uppercase text-center hover:bg-background hover:text-foreground transition-all duration-300"
              >
                Browse Public Portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

