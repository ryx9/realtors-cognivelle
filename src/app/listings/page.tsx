import { getListings, getAgents } from '@/lib/data-service';
import ListingCard from '@/components/ListingCard';
import { Building2, Filter } from 'lucide-react';
import Link from 'next/link';

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

  const propertyTypes = ['Single Family', 'Penthouse', 'Townhouse', 'Villa', 'Condo'];
  const cities = Array.from(new Set(allListings.map((l) => l.city)));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2">
            <Building2 className="w-4 h-4" />
            <span>Exclusive Portfolio</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Available Luxury Residences
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-xl">
            Schedule direct in-person showings or live video walkthroughs in your exact local timezone.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-10 shadow-xl">
          <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Agent filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Filter by Agent</label>
              <select
                name="agentId"
                defaultValue={searchParams.agentId || ''}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">All Agents</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.timezone})
                  </option>
                ))}
              </select>
            </div>

            {/* Property Type filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Property Type</label>
              <select
                name="type"
                defaultValue={searchParams.type || ''}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">All Types</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* City filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">City</label>
              <select
                name="city"
                defaultValue={searchParams.city || ''}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex items-end space-x-2">
              <button
                type="submit"
                className="flex-1 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Apply Filters</span>
              </button>
              <Link
                href="/listings"
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Reset
              </Link>
            </div>
          </form>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No listings matched your filters</h3>
            <p className="text-xs">Try selecting a different agent or clearing your search criteria.</p>
            <Link
              href="/listings"
              className="inline-block mt-4 text-xs font-semibold text-amber-400 hover:underline"
            >
              Clear all filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
