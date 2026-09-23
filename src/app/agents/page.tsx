import { getAgents } from '@/lib/data-service';
import AgentCard from '@/components/AgentCard';
import Link from 'next/link';
import { ShieldCheck, Award, Users } from 'lucide-react';

export const revalidate = 0;

export default async function AgentsPage({
  searchParams,
}: {
  searchParams?: { market?: string };
}) {
  const allAgents = await getAgents();

  const selectedMarket = searchParams?.market?.toLowerCase();
  const agents = selectedMarket
    ? allAgents.filter((a) => a.title && a.title.toLowerCase().includes(selectedMarket))
    : allAgents;

  const markets = [
    { label: 'All Advisors', value: '' },
    { label: 'Manhattan', value: 'manhattan' },
    { label: 'West Coast', value: 'beverly' },
    { label: 'London', value: 'mayfair' },
    { label: 'Tokyo', value: 'tokyo' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Editorial Header */}
      <div className="border-b border-border py-8 sm:py-12 md:py-14 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-accent inline-block" />
            <p className="text-[10px] tracking-widest uppercase text-accent font-bold">
              Private Client Advisory
            </p>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-foreground leading-tight tracking-tight mb-3">
            Real Estate Advisors
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-lg leading-relaxed">
            Licensed directors and principal brokers operating across top global hubs. Direct consultation scheduling with real-time calendar synchronization.
          </p>

          {/* Market Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-border/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted mr-1">
              Select Hub:
            </span>
            {markets.map((m) => (
              <Link
                key={m.label}
                href={m.value ? `/agents?market=${m.value}` : '/agents'}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider border transition-colors ${
                  (!selectedMarket && !m.value) || (selectedMarket && selectedMarket === m.value)
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted border-border hover:text-foreground hover:border-foreground'
                }`}
              >
                {m.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Advisors Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Representing <span className="text-foreground font-black">{agents.length}</span> {agents.length === 1 ? 'Advisor' : 'Advisors'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border shadow-md">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-background">
              <AgentCard agent={agent} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

