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
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-amber-800 font-medium mb-2">
            <Building2 className="w-4 h-4" />
            <span>Our Portfolio</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-light text-stone-900">
            Available <span className="font-semibold">Residences</span>
          </h1>
          <p className="mt-3 text-sm text-stone-500 max-w-xl leading-relaxed">
            Explore our curated collection of luxury properties. Schedule a private showing at your convenience.
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 mb-10 shadow-sm">
          <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">Advisor</label>
              <select
                name="agentId"
                defaultValue={searchParams.agentId || ''}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
              >
                <option value="">All Advisors</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">Property Type</label>
              <select
                name="type"
                defaultValue={searchParams.type || ''}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
              >
                <option value="">All Types</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">City</label>
              <select
                name="city"
                defaultValue={searchParams.city || ''}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                type="submit"
                className="flex-1 py-2 px-4 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
              <Link
                href="/listings"
                className="py-2 px-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-medium transition-colors"
              >
                Reset
              </Link>
            </div>
          </form>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500">
            <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-stone-900 mb-1">No properties match your criteria</h3>
            <p className="text-xs">Try adjusting your filters or browse our full collection.</p>
            <Link
              href="/listings"
              className="inline-block mt-4 text-xs font-medium text-amber-800 hover:underline"
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
