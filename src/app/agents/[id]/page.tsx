import { getAgentById, getListings } from '@/lib/data-service';
import BookingWidget from '@/components/BookingWidget';
import ListingCard from '@/components/ListingCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Globe, Mail, Phone, Building2 } from 'lucide-react';

export const revalidate = 0;

export default async function AgentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const agent = await getAgentById(params.id);

  if (!agent) {
    notFound();
  }

  const agentListings = await getListings({ agentId: agent.id });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/agents"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all agents</span>
          </Link>
        </div>

        {/* Agent Profile Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 mb-12 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <img
              src={agent.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
              alt={agent.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-amber-400/80 shadow-xl"
            />
            <div className="flex-1">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block mb-1">
                Licensed Realtor
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{agent.name}</h1>
              <p className="text-sm text-slate-300 font-medium mt-0.5">{agent.title}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-400">
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-amber-400 font-mono">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Timezone: {agent.timezone}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{agent.email}</span>
                </div>
                {agent.phone && (
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{agent.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {agent.bio && (
            <div className="mt-8 pt-6 border-t border-slate-800">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">About {agent.name}</h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                {agent.bio}
              </p>
            </div>
          )}
        </div>

        {/* 2-Column Section: Consultation Booking on Left/Right and Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>Properties Represented by {agent.name}</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {agentListings.length} {agentListings.length === 1 ? 'Listing' : 'Listings'}
              </span>
            </div>

            {agentListings.length === 0 ? (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
                No active listings currently assigned to this agent.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {agentListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <BookingWidget agent={agent} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
