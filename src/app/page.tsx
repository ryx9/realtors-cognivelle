import Link from 'next/link';
import { getListings, getAgents } from '@/lib/data-service';
import ListingCard from '@/components/ListingCard';
import AgentCard from '@/components/AgentCard';
import { Building2, Globe, Key, ArrowRight } from 'lucide-react';

export const revalidate = 0;

export default async function HomePage() {
  const [listings, agents] = await Promise.all([
    getListings({ status: 'active' }),
    getAgents(),
  ]);

  const featuredListings = listings.filter((l) => l.featured).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-36 border-b border-stone-200/80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-100/40 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 text-stone-600 text-xs font-medium uppercase tracking-widest mb-8 shadow-sm">
            <span>Est. 2018 · Global Luxury Brokerage</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-stone-900 max-w-4xl mx-auto leading-[1.1]">
            Exceptional Residences,{' '}
            <span className="font-semibold italic text-amber-800">
              Extraordinary Lives
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-stone-500 max-w-2xl mx-auto font-light leading-relaxed">
            From Manhattan penthouses to Malibu oceanfront estates — Cognivelle connects discerning buyers with the world&apos;s most coveted properties through personalized, white-glove service.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/listings"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-medium transition-all shadow-lg shadow-stone-900/10 flex items-center justify-center space-x-2 text-sm"
            >
              <span>Explore Properties</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/agents"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-stone-50 text-stone-700 font-medium transition-all border border-stone-200 flex items-center justify-center space-x-2 text-sm shadow-sm"
            >
              <span>Meet Our Advisors</span>
            </Link>
          </div>

          {/* Value Pillars */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-7 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="text-stone-900 font-semibold text-sm mb-2">Bespoke Advisory</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Every client receives dedicated representation from a licensed specialist who understands your market, your timeline, and your vision.
              </p>
            </div>

            <div className="bg-white border border-stone-200/80 rounded-2xl p-7 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-stone-900 font-semibold text-sm mb-2">Global Reach</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Our advisors operate across premier markets in New York, London, Malibu, Tokyo, and beyond — wherever your next chapter begins.
              </p>
            </div>

            <div className="bg-white border border-stone-200/80 rounded-2xl p-7 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-stone-900 font-semibold text-sm mb-2">Curated Portfolio</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Each property in our collection is hand-selected for architectural distinction, location, and lasting value.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-800 font-medium block mb-2">
              Curated Portfolio
            </span>
            <h2 className="text-2xl sm:text-4xl font-light text-stone-900">
              Featured <span className="font-semibold">Listings</span>
            </h2>
          </div>
          <Link
            href="/listings"
            className="mt-4 sm:mt-0 text-sm text-stone-600 hover:text-amber-800 font-medium flex items-center space-x-1 transition-colors"
          >
            <span>View all properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* Agents Section */}
      <section className="py-20 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest text-amber-800 font-medium block mb-2">
              Our Team
            </span>
            <h2 className="text-2xl sm:text-4xl font-light text-stone-900">
              Meet Our <span className="font-semibold">Advisors</span>
            </h2>
            <p className="mt-4 text-sm text-stone-500 leading-relaxed">
              Licensed specialists with deep local expertise and a shared commitment to exceptional client service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
