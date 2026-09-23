import { getListings, getAgents } from '@/lib/data-service';
import ListingCard from '@/components/ListingCard';
import Link from 'next/link';
import { Filter, RotateCcw, Building, MapPin, User, Sparkles } from 'lucide-react';

export const revalidate = 0;

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { agentId?: string; type?: string; city?: string };
}) {
  const [allListings, agents] = await Promise.all([
    getListings(),
    getAgents(),
  ]);

  const filtered = allListings.filter((l) => {
    if (searchParams.agentId && l.agent_id !== searchParams.agentId) return false;
    if (searchParams.type && l.property_type.toLowerCase() !== searchParams.type.toLowerCase()) return false;
    if (searchParams.city && !l.city.toLowerCase().includes(searchParams.city.toLowerCase())) return false;
    return true;
  });

  const propertyTypes = ['Penthouse', 'Townhouse', 'Villa', 'Condo'];
  const cities = Array.from(new Set(allListings.map((l) => l.city)));

  const isFiltered = Boolean(searchParams.agentId || searchParams.type || searchParams.city);

  return (
    <div className="min-h-screen bg-background">
      {/* Editorial Header */}
      <div className="border-b border-border py-8 sm:py-12 md:py-14 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-accent inline-block" />
            <p className="text-[10px] tracking-widest uppercase text-accent font-bold">
              Cognivelle Portfolio
            </p>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-foreground leading-tight tracking-tight mb-3">
            Prime Residences
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-lg leading-relaxed">
            A hand-selected global collection of architectural landmarks and trophy residences. Direct scheduling with lead listing advisors.
          </p>

          {/* Quick Property Type Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-border/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted mr-1">
              Quick Filter:
            </span>
            <Link
              href="/listings"
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider border transition-colors ${
                !searchParams.type
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted border-border hover:text-foreground hover:border-foreground'
              }`}
            >
              All Types
            </Link>
            {propertyTypes.map((type) => (
              <Link
                key={type}
                href={`/listings?type=${encodeURIComponent(type)}${searchParams.city ? `&city=${encodeURIComponent(searchParams.city)}` : ''}`}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider border transition-colors ${
                  searchParams.type?.toLowerCase() === type.toLowerCase()
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted border-border hover:text-foreground hover:border-foreground'
                }`}
              >
                {type}s
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Symmetrical Filter Bar */}
      <div className="border-b border-border bg-background sticky top-14 sm:top-16 z-30 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            <div className="lg:col-span-3">
              <label className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-muted mb-1">
                <User className="w-3 h-3 text-accent" />
                Advisor
              </label>
              <select
                name="agentId"
                defaultValue={searchParams.agentId || ''}
                className="w-full bg-background border border-border px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-foreground"
              >
                <option value="">All Advisors</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-muted mb-1">
                <Building className="w-3 h-3 text-accent" />
                Residence Type
              </label>
              <select
                name="type"
                defaultValue={searchParams.type || ''}
                className="w-full bg-background border border-border px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-foreground"
              >
                <option value="">All Types</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-muted mb-1">
                <MapPin className="w-3 h-3 text-accent" />
                Metropolitan Market
              </label>
              <select
                name="city"
                defaultValue={searchParams.city || ''}
                className="w-full bg-background border border-border px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-foreground"
              >
                <option value="">All Markets</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3 flex gap-2 pt-1 sm:pt-0">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-foreground text-background font-bold text-xs tracking-widest uppercase hover:bg-accent transition-colors flex items-center justify-center gap-1.5"
              >
                <Filter className="w-3 h-3" />
                Filter
              </button>
              {isFiltered && (
                <Link
                  href="/listings"
                  className="py-2.5 px-3 border border-border text-muted hover:text-foreground hover:border-foreground transition-colors flex items-center justify-center"
                  title="Reset filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Main Listings Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Results Count & Status */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Showing <span className="text-foreground font-black">{filtered.length}</span> {filtered.length === 1 ? 'Residence' : 'Residences'}
          </p>
          {isFiltered && (
            <Link href="/listings" className="text-xs text-accent hover:underline uppercase font-bold tracking-wider">
              Clear All Filters
            </Link>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="border border-border bg-card p-12 sm:p-16 text-center max-w-lg mx-auto shadow-sm">
            <Sparkles className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="font-display font-black uppercase text-xl text-foreground mb-2">
              No Matches Found
            </h3>
            <p className="text-xs text-muted leading-relaxed mb-6">
              No residences matched your criteria. You can clear filters or request an off-market consultation.
            </p>
            <Link
              href="/listings"
              className="inline-block py-2.5 px-6 bg-foreground text-background text-xs font-bold tracking-widest uppercase hover:bg-accent transition-colors"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border shadow-md">
            {filtered.map((listing) => (
              <div key={listing.id} className="bg-background">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

