import Link from 'next/link';
import { getListings, getAgents } from '@/lib/data-service';
import ListingCard from '@/components/ListingCard';
import AgentCard from '@/components/AgentCard';
import { Building2, ShieldCheck, Globe, ArrowRight } from 'lucide-react';

export const revalidate = 0; // Dynamic data

export default async function HomePage() {
  const [listings, agents] = await Promise.all([
    getListings({ status: 'active' }),
    getAgents(),
  ]);

  const featuredListings = listings.filter((l) => l.featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-36 border-b border-slate-900">
        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-lg shadow-amber-500/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PostgreSQL Atomic Slot Conflict Engine • Supabase Powered</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Global Luxury Real Estate,{' '}
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
              Synchronized Across Timezones
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Browse premier residences in New York, London, Malibu, and Tokyo. Schedule in-person or live virtual showings aligned seamlessly with agents across world timezones.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/listings"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 text-sm"
            >
              <span>Explore Exclusive Properties</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold transition-all border border-slate-800 flex items-center justify-center space-x-2 text-sm"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Dashboard & Conflict Tester</span>
            </Link>
          </div>

          {/* Key Architectural Pillars */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold text-sm mb-1">Zero Double-Booking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                PostgreSQL <code className="text-amber-400 font-mono">btree_gist</code> exclusion constraints reject simultaneous or overlapping bookings at the database kernel level.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold text-sm mb-1">Multi-Timezone Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Agents operate in their local working hours (EST, PST, BST, JST) while clients view and book showings in their exact local timezone.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold text-sm mb-1">Agent-Aligned Listings</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full relational integrity linking properties directly to dedicated specialists with customizable showing slots and tour modes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block mb-1">
              Curated Portfolio
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Featured Luxury Listings
            </h2>
          </div>
          <Link
            href="/listings"
            className="mt-4 sm:mt-0 text-sm text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
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

      {/* Global Agents Section */}
      <section className="py-20 bg-slate-900/30 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block mb-1">
              Cross-Border Experts
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Meet Our Global Specialists
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Each dedicated agent manages exclusive portfolios across distinct timezones with bespoke consultation slots.
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
