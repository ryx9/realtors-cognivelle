import { getAgents } from '@/lib/data-service';
import AgentCard from '@/components/AgentCard';
import { Users } from 'lucide-react';

export const revalidate = 0;

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-amber-800 font-medium mb-2">
            <Users className="w-4 h-4" />
            <span>Our Team</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-light text-stone-900">
            Real Estate <span className="font-semibold">Advisors</span>
          </h1>
          <p className="mt-4 text-sm text-stone-500 leading-relaxed">
            Licensed specialists with deep expertise in their markets. Reach out to schedule a private consultation or property tour.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}
